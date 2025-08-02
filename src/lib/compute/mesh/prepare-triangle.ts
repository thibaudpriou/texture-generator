import { computeIncenter } from './compute-incenter';
import { coordToPoints } from './coord-to-points';
import { createDelaunayMesh } from './create-delaunay-mesh';
import { hashPoint } from './hash-point';
import type { Triangle, PointHash } from './types';

export const prepareTriangle = ({
	width,
	height,
	nbPoints
}: {
	width: number;
	height: number;
	nbPoints: number;
}) => {
	// create triangles
	const delaunayTrianglesCoordinates = createDelaunayMesh(width, height, nbPoints);

	const triangles: Triangle[] = [];
	const trianglesByNodes: Record<PointHash, Record<Triangle['id'], true>> = {};
	for (const id in delaunayTrianglesCoordinates) {
		const coordinates = delaunayTrianglesCoordinates[id];
		const triangle = {
			id,
			coordinates,
			incenter: computeIncenter(coordinates)
		};

		triangles.push(triangle);
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
		triangles
	};
};
