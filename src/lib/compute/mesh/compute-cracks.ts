import { decryptHash } from './hash-point';
import type { Point, PointHash, Triangle, TrianglesById, TrianglesByNodes } from './types';

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
const computeStress = (node: Point, triangles: Triangle[]): Stress => {
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
		stressByNodes[nodeId] = computeStress(
			node,
			triangleIds.map((id) => trianglesById[id])
		);
	}

	return stressByNodes;
};

export const computeCracks = ({
	trianglesById,
	trianglesByNodes
}: {
	trianglesById: TrianglesById;
	trianglesByNodes: TrianglesByNodes;
}) => {
	const stressByNodes = getPressuredNodes({
		trianglesById,
		trianglesByNodes
	});

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

	// TODO @tpriou create new nodes & new triangles => we could re-use delaunay triangulation!?
	// TODO @tpriou create new nodes & new triangles
	// TODO relaxation step: edit stress vector
	// TODO return everything
};
