import { HEIGHT, MATERIAL_TOUGHNESS, VERBOSE, WIDTH } from '$lib/constants';
import { coordToPoints } from './coord-to-points';
import { createDelaunayMesh } from './create-delaunay-mesh';
import { getTriangleId } from './get-triangle-id';
import { decryptHash, getPointFromHash, hashPoint } from './hash-point';
import { addTriangles } from './prepare-triangles';
import { sanitizeCoord } from './sanitize-coord';
import type {
	ComputeStressFn,
	Point,
	PointHash,
	StressVector,
	Triangle,
	TriangleId,
	TrianglesById,
	TrianglesByNodes
} from './types';

type Stress = {
	value: number;
	newNode: Point;
};

const MAX_DISTANCE_SQUARED = WIDTH ** 2 + HEIGHT ** 2;

const computeRelativeStress = (node: Point, triangle: Triangle) => {
	const distanceSquared =
		(triangle.incenter[0] - node[0]) ** 2 + (triangle.incenter[1] - node[1]) ** 2;
	const distanceNormalized = distanceSquared / MAX_DISTANCE_SQUARED;
	return distanceNormalized * triangle.stressVector.value;
};

/**
 * Cracked point is relative to:
 * - the force applied by given triangle
 * - material toughness
 */
const computeCrackedPoint = (node: Point, triangle: Triangle, relativeForce: number): Point => {
	const directionRatio = MATERIAL_TOUGHNESS; // TODO use better heuristic?

	const newNodeX = (triangle.incenter[0] - node[0]) * directionRatio * relativeForce + node[0];
	const newNodeY = (triangle.incenter[1] - node[1]) * directionRatio * relativeForce + node[1];

	return [sanitizeCoord(newNodeX), sanitizeCoord(newNodeY)];
};

/**
 * Compute stress force applied on given node
 *
 * Curent algorithm:
 * - for each triangle
 * 		- compute stress applied to node: (distanceToIncenter * value)
 * - normalize
 */
const computeStressForNode = (node: Point, triangles: Triangle[]): Stress => {
	const stressValue = triangles.reduce(
		(sum, triangle) => sum + computeRelativeStress(node, triangle),
		0
	);
	const normalizedStressValue = stressValue / triangles.length;

	/**
	 * new node is placed in the direction of the incenter of some triangle
	 * TODO add more nodes? use all triangles to infer direction?
	 */
	let mostStressfullTriangle = triangles[0];
	let forceMax = computeRelativeStress(node, mostStressfullTriangle);
	for (const triangle of triangles) {
		const force = computeRelativeStress(node, triangle);
		if (forceMax < force) {
			mostStressfullTriangle = triangle;
			forceMax = force;
		}
	}

	const crackedNode = computeCrackedPoint(node, mostStressfullTriangle, forceMax);

	return {
		value: normalizedStressValue,
		newNode: crackedNode
	};
};

const getPressuredNodes = ({
	trianglesById,
	trianglesByNodes
}: {
	trianglesById: TrianglesById;
	trianglesByNodes: TrianglesByNodes;
}): Record<PointHash, Stress> => {
	const stressByNodes: Record<PointHash, Stress> = {};
	const entries = Object.entries(trianglesByNodes) as [
		keyof TrianglesByNodes,
		TrianglesByNodes[PointHash]
	][];

	for (const [nodeId] of entries) {
		const triangleIdsForNode = trianglesByNodes[nodeId];
		const triangleIds = Object.keys(triangleIdsForNode);
		const node = decryptHash(nodeId);
		const stress = computeStressForNode(
			node,
			triangleIds.map((id) => trianglesById[id])
		);
		if (stress) {
			stressByNodes[nodeId] = stress;
		}
	}

	return stressByNodes;
};

/**
 * Mutates given data to add cracks
 *
 * Ubiquitous language:
 * - cracking node: a node selected for the crack generation
 * - cracked node: a newly-created node
 * - cracked triangle: a triangle that has both cracked and cracking nodes among their vertices
 * - nearby triangle of given node: a triangle where node is a vertex
 * - stress vector of a triangle:
 * 		- represented by its value
 * 		- exerts 3 forces on its 3 respective vertices
 *
 * Current crack algorithm:
 * - select a cracking node using nearby triangle's stress vectors
 * 		- using the stress vector field of all nearby triangles
 * - create cracked node
 * 		- toward the incenter of the most stressful nearby triangle
 * 		- [alt algo]: sum of all the stress vectors
 * - [hack] re-compute Delaunay mesh using every existing nodes + cracked node
 *
 *
 * TODO Aternative algorithm:
 * - for every "crack candidate" node (aka "cracking")
 * - select a triangle (e.g. the ones with stress > threshold). You can limit the number of selected triangles
 *    - at least 1
 *    - 20% chance of 2: split crack probability
 *    - 3? 4? etc
 * - create a node there (using incenter?) aka the "cracked" node
 * - delete this triangle + create 3 new triangles with the new node":
 *    - 2 of them are cracked triangles, i.e. 2 of their vertices are the cracking and the cracked
 *    - add lots of stress there to allow crack expansion
 * - relax stress on every other triangle
 * - exclude the cracking and cracked to pressured nodes
 */
export const simulateCracks = (data: {
	trianglesById: TrianglesById;
	trianglesByNodes: TrianglesByNodes;
}) => {
	const stressByNodes = getPressuredNodes(data);

	// ! DEBUG ONLY
	if (VERBOSE) {
		console.log('stress computed', stressByNodes, JSON.parse(JSON.stringify(data)));
	}

	// nominate nodes to crack: maximum stress
	let maxPressuredNode: { stress: Stress; nodeId: PointHash } | undefined = undefined;
	const nodeIds = Object.keys(stressByNodes) as PointHash[];
	for (const nodeId of nodeIds) {
		const stress = stressByNodes[nodeId];
		if (!maxPressuredNode || stress.value > maxPressuredNode.stress.value) {
			maxPressuredNode = {
				stress,
				nodeId
			};
		}
	}
	if (!maxPressuredNode) {
		// should not happen
		throw new Error('Could not find most pressured node');
	}

	/**
	 * Let's create a new point computed in computeStress()
	 * And create new triangles:
	 * - with this new node
	 * - and update the existing ones
	 *
	 * TODO possible improvements
	 * - also move existing node?
	 * - create more points?
	 */

	// ! <DEBUG> removal useless for now: we re-mesh everything
	const impactedNodesIds = new Set<PointHash>();
	const deleteTriangle = (triangleId: TriangleId) => {
		const triangle = data.trianglesById[triangleId];
		const nodes = coordToPoints(triangle.coordinates);
		for (const node of nodes) {
			const nodeId = hashPoint(node);
			impactedNodesIds.add(nodeId);
			delete data.trianglesByNodes[nodeId][triangleId];
		}
		delete data.trianglesById[triangleId];
	};

	// remove old triangles around this node
	const {
		nodeId,
		stress: { newNode }
	} = maxPressuredNode;
	const trianglesIds: TriangleId[] = Object.keys(data.trianglesByNodes[nodeId]);
	for (const triangleId of trianglesIds) {
		deleteTriangle(triangleId);
	}
	// ! </DEBUG>

	// add new node
	data.trianglesByNodes[nodeId] = {};

	// compute new triangles with Delaunay
	const existingNodeIds = Object.keys(data.trianglesByNodes) as PointHash[];
	const newTrianglesNodes = [newNode, ...existingNodeIds.map(getPointFromHash)];
	// const newTrianglesNodes = [newNode, ...impactedNodesIds.keys().map(getPointFromHash)];

	// ! DEBUG ONLY
	if (VERBOSE) {
		console.log(
			'before re-meshing',
			maxPressuredNode,
			JSON.parse(JSON.stringify(data)),
			newTrianglesNodes
		);
	}

	const newTrianglesCoordinates = createDelaunayMesh(newTrianglesNodes.flat());
	const getStressVector: ComputeStressFn = (triangle) => {
		const id = getTriangleId(triangle);
		const found = data.trianglesById[id];

		// new triangles get 0
		return {
			value: found?.stressVector.value ?? Math.random() * 0.5, // TODO change stress vector for new triangles
			isCracked: found ? found.stressVector.isCracked : true
		} satisfies StressVector;
	};

	const newData = {
		trianglesById: {},
		trianglesByNodes: {}
	};
	addTriangles(newTrianglesCoordinates, newData, getStressVector);

	// ! DEBUG ONLY
	if (VERBOSE) {
		console.log(
			'after re-meshing',
			maxPressuredNode,
			JSON.parse(JSON.stringify(newData)),
			newTrianglesNodes.length,
			newTrianglesNodes
		);
	}

	return newData;
};
