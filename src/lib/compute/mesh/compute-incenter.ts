import type { Coord, Point, TriangleCoordinates } from './types';

import incenter from 'triangle-incenter';

export const computeIncenter = (coordinates: TriangleCoordinates): Point => {
	return incenter([
		[coordinates[0], coordinates[1]],
		[coordinates[2], coordinates[3]],
		[coordinates[4], coordinates[5]]
	]) as [Coord, Coord];
};
