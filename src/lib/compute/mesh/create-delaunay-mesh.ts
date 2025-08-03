import type { Coord, TriangleCoordinates } from './types';
import Delaunator from 'delaunator';

/**
 * Randomly generate triangle from rectangle
 */
export const createDelaunayMesh = (pointsCoords: Coord[]): TriangleCoordinates[] => {
	const delaunay = new Delaunator(pointsCoords);
	if (!delaunay) {
		throw new Error('Something happened with Delaunator');
	}

	const triangles = delaunay.triangles as unknown as Coord[]; // array of point indice

	const result: TriangleCoordinates[] = [];
	for (let i = 0; i < triangles.length; i += 3) {
		result.push([
			pointsCoords[2 * triangles[i]],
			pointsCoords[2 * triangles[i] + 1],
			pointsCoords[2 * triangles[i + 1]],
			pointsCoords[2 * triangles[i + 1] + 1],
			pointsCoords[2 * triangles[i + 2]],
			pointsCoords[2 * triangles[i + 2] + 1]
		]);
	}

	return result;
};
