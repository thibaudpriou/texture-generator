import type { Point, PointHash } from './types';

export const hashPoint = (point: Point): PointHash => `${point[0]}-${point[1]}`;

export const decryptHash = (hash: PointHash): Point => {
	const coords = hash.split('-') as [string, string];
	return [Number(coords[0]), Number(coords[1])];
};

export const getPointFromHash = decryptHash;
