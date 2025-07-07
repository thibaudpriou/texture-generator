import type { Coord, Triangle } from './types';
import Delaunator from 'delaunator';

/**
 * Randomly generate triangle from rectangle
 *
 */
export const createDelaunayMesh = (width: number, height: number, nbPoints: number): Triangle[] => {
	const points: Coord[] = [0, 0, width, 0, width, height, 0, height]; // 2 subsequent coord for a point
	for (let i = 0; i < (nbPoints - 1) * 2; i++) {
		const x = Math.floor(Math.random() * width);
		const y = Math.floor(Math.random() * height);
		points.push(x, y);
	}

	const delaunay = new Delaunator(points);

	const triangles = delaunay.triangles as number[]; // array of point indice

	const result: Triangle[] = [];
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
