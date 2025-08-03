import { coordToPoints } from './coord-to-points';
import { createDelaunayMesh } from './create-delaunay-mesh';
import { decryptHash, getPointFromHash, hashPoint } from './hash-point';
import { addTriangles } from './prepare-triangles';
import type {
	Point,
	PointHash,
	Triangle,
	TriangleId,
	TrianglesById,
	TrianglesByNodes
} from './types';

type Stress = {
	value: number;
	newNode: Point;
};

/**
 * Compute stress force applied on given node
 *
 * Curent algorithm:
 * - sum all of its triangles stress
 * - normalize
 *
 * TODO use distance to incenter? closer triangles should apply more force
 */
const computeStress = (node: Point, triangles: Triangle[]): Stress | null => {
	const sum = triangles.reduce((sum, triangle) => sum + triangle.stressVector, 0);

	/**
	 * new node is placed in the direction of the incenter of the 1st triangle
	 * TODO add more nodes? use all triangles to infer direction?
	 */
	const directionRatio = 0.5; // TODO use better heuristic
	const firstTriangleIncenter = triangles[0].incenter;
	const newNodeX = (firstTriangleIncenter[0] - node[0]) * directionRatio + node[0];
	const newNodeY = (firstTriangleIncenter[1] - node[1]) * directionRatio + node[1];

	return {
		value: sum / triangles.length,
		newNode: [newNodeX, newNodeY]
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
		const stress = computeStress(
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
 */
export const simulateCracks = (
	data: {
		trianglesById: TrianglesById;
		trianglesByNodes: TrianglesByNodes;
	},
	iterationNb: number
) => {
	const stressByNodes = getPressuredNodes(data);

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

	// ! DEBUG ONLY
	console.log('before removal', maxPressuredNode, JSON.parse(JSON.stringify(data)));

	const impactedNodesIds = new Set<PointHash>();
	const deleteTriangle = (triangleId: TriangleId) => {
		const triangle = data.trianglesById[triangleId];
		const nodes = coordToPoints(triangle.coordinates);
		for (const node of nodes) {
			const nodeId = hashPoint(node);
			impactedNodesIds.add(nodeId);
			delete data.trianglesByNodes[nodeId][triangleId];
		}
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

	// ! DEBUG ONLY
	console.log(
		'after removal',
		maxPressuredNode,
		JSON.parse(JSON.stringify(data)),
		impactedNodesIds
	);

	// add new node
	data.trianglesByNodes[nodeId] = {};

	// compute new triangles with Delaunay
	const newTrianglesNodes = [newNode, ...impactedNodesIds.keys().map(getPointFromHash)];

	// ! DEBUG ONLY
	console.log(
		'before re-meshing',
		maxPressuredNode,
		JSON.parse(JSON.stringify(data)),
		newTrianglesNodes
	);

	const newTrianglesCoordinates = createDelaunayMesh(newTrianglesNodes.flat());
	const getStressVector = () => 0; // TODO relaxation step: edit stress vector instead of hard reset
	const getTriangleId = (index: string) => `${iterationNb}-${index}`; // make sure to have unique ids
	addTriangles(newTrianglesCoordinates, data, getTriangleId, getStressVector);

	// ! DEBUG ONLY
	console.log(
		'after re-meshing',
		maxPressuredNode,
		JSON.parse(JSON.stringify(data)),
		newTrianglesNodes
	);

	return data;
};
