import type { Point, Triangle } from './types';

export const coordToPoints = (coordinates: Triangle['coordinates']): [Point, Point, Point] => {
	return [
		[coordinates[0], coordinates[1]],
		[coordinates[2], coordinates[3]],
		[coordinates[4], coordinates[5]]
	];
};
