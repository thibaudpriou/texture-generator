import { computeIncenter } from './compute-incenter';
import { coordToPoints } from './coord-to-points';
import { createDelaunayMesh } from './create-delaunay-mesh';
import { hashPoint } from './hash-point';
import type { Triangle, PointHash } from './types';

export const prepareTriangle = (width: number, height: number, nbPoints: number) => {
	// create triangles
	const delaunayTrianglesCoordinates = createDelaunayMesh(width, height, nbPoints);

	const triangles: Triangle[] = [];
	const nodesByTriangles: Record<PointHash, Record<Triangle['id'], true>> = {};
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
		if (!nodesByTriangles[p1Index]) {
			nodesByTriangles[p1Index] = {};
		}
		nodesByTriangles[p1Index][p1Index] = true;
		if (!nodesByTriangles[p2Index]) {
			nodesByTriangles[p2Index] = {};
		}
		nodesByTriangles[p2Index][p2Index] = true;
		if (!nodesByTriangles[p3Index]) {
			nodesByTriangles[p3Index] = {};
		}
		nodesByTriangles[p3Index][p3Index] = true;
	}

	// TODO init stress vector to each triangle

	return {
		nodesByTriangles,
		triangles
	};
};
