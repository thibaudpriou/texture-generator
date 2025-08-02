import type { Coord, TriangleCoordinates } from './types';
import Delaunator from 'delaunator';

/**
 * Randomly generate triangle from rectangle
 *
 */
export const createDelaunayMesh = (
	width: number,
	height: number,
	nbPoints: number
): TriangleCoordinates[] => {
	const points: Coord[] = [0, 0, width, 0, width, height, 0, height]; // 2 subsequent coord for a point
	for (let i = 0; i < (nbPoints - 1) * 2; i++) {
		const x = Math.floor(Math.random() * width);
		const y = Math.floor(Math.random() * height);
		points.push(x, y);
	}

	const delaunay = new Delaunator(points);
	if (!delaunay) {
		throw new Error('Something happened with Delaunator');
	}

	const triangles = delaunay.triangles as unknown as Coord[]; // array of point indice

	const result: TriangleCoordinates[] = [];
	for (let i = 0; i < triangles.length; i += 3) {
		result.push([
			points[2 * triangles[i]],
			points[2 * triangles[i] + 1],
			points[2 * triangles[i + 1]],
			points[2 * triangles[i + 1] + 1],
			points[2 * triangles[i + 2]],
			points[2 * triangles[i + 2] + 1]
		]);
	}

	return result;
};
