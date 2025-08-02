import { computeIncenter } from './compute-incenter';
import { coordToPoints } from './coord-to-points';
import { createDelaunayMesh } from './create-delaunay-mesh';
import { hashPoint } from './hash-point';
import type { Triangle, StreeVector, TrianglesById, TrianglesByNodes } from './types';

export const prepareTriangles = ({
	width,
	height,
	nbPoints,
	getStressVector
}: {
	width: number;
	height: number;
	nbPoints: number;
	getStressVector: (triangle: Pick<Triangle, 'coordinates' | 'incenter'>) => StreeVector;
}): {
	trianglesById: TrianglesById;
	trianglesByNodes: TrianglesByNodes;
} => {
	// create triangles
	const delaunayTrianglesCoordinates = createDelaunayMesh(width, height, nbPoints);

	const trianglesById: TrianglesById = {};
	const trianglesByNodes: TrianglesByNodes = {};
	for (const index in delaunayTrianglesCoordinates) {
		const coordinates = delaunayTrianglesCoordinates[index];
		const incenter = computeIncenter(coordinates);
		const stressVector = getStressVector({ coordinates, incenter });

		const id = index;
		const triangle: Triangle = {
			id,
			coordinates,
			incenter,
			stressVector
		};

		trianglesById[id] = triangle;
		const points = coordToPoints(coordinates);

		// generate index for easy processing in the future
		const p1Index = hashPoint(points[0]);
		const p2Index = hashPoint(points[1]);
		const p3Index = hashPoint(points[2]);
		if (!trianglesByNodes[p1Index]) {
			trianglesByNodes[p1Index] = {};
		}
		trianglesByNodes[p1Index][id] = true;
		if (!trianglesByNodes[p2Index]) {
			trianglesByNodes[p2Index] = {};
		}
		trianglesByNodes[p2Index][id] = true;
		if (!trianglesByNodes[p3Index]) {
			trianglesByNodes[p3Index] = {};
		}
		trianglesByNodes[p3Index][id] = true;
	}

	// TODO init stress vector to each triangle

	return {
		trianglesByNodes,
		trianglesById
	};
};
