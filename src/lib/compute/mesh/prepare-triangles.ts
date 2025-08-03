import { computeIncenter } from './compute-incenter';
import { coordToPoints } from './coord-to-points';
import { createDelaunayMesh } from './create-delaunay-mesh';
import { generatePointsCoordinates } from './generate-points-coordinates';
import { getTriangleId } from './get-triangle-id';
import { hashPoint } from './hash-point';
import type {
	Triangle,
	TrianglesById,
	TrianglesByNodes,
	TriangleCoordinates,
	ComputeStressFn
} from './types';

/**
 * Mutates @param memory to add given triangles
 */
export const addTriangles = (
	triangleCoordinates: TriangleCoordinates[],
	memory: {
		trianglesById: TrianglesById;
		trianglesByNodes: TrianglesByNodes;
	},
	getStressVector: ComputeStressFn
) => {
	for (const index in triangleCoordinates) {
		const coordinates = triangleCoordinates[index];
		const incenter = computeIncenter(coordinates);
		const stressVector = getStressVector({ coordinates, incenter });

		const id = getTriangleId({ incenter });
		const triangle: Triangle = {
			id,
			coordinates,
			incenter,
			stressVector
		};

		memory.trianglesById[id] = triangle;
		const points = coordToPoints(coordinates);

		// generate index for easy processing in the future
		const p1Index = hashPoint(points[0]);
		const p2Index = hashPoint(points[1]);
		const p3Index = hashPoint(points[2]);
		if (!memory.trianglesByNodes[p1Index]) {
			memory.trianglesByNodes[p1Index] = {};
		}
		memory.trianglesByNodes[p1Index][id] = true;
		if (!memory.trianglesByNodes[p2Index]) {
			memory.trianglesByNodes[p2Index] = {};
		}
		memory.trianglesByNodes[p2Index][id] = true;
		if (!memory.trianglesByNodes[p3Index]) {
			memory.trianglesByNodes[p3Index] = {};
		}
		memory.trianglesByNodes[p3Index][id] = true;
	}
};

export const prepareTriangles = ({
	width,
	height,
	nbPoints,
	getStressVector
}: {
	width: number;
	height: number;
	nbPoints: number;
	getStressVector: ComputeStressFn;
}): {
	trianglesById: TrianglesById;
	trianglesByNodes: TrianglesByNodes;
} => {
	// create triangles
	const coords = generatePointsCoordinates({ width, height, nbPoints });
	const triangleCoordinates = createDelaunayMesh(coords);

	const memory = {
		trianglesById: {} as TrianglesById,
		trianglesByNodes: {} as TrianglesByNodes
	};
	addTriangles(triangleCoordinates, memory, getStressVector);

	return memory;
};
