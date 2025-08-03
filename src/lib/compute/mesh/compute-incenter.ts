import { sanitizeCoord } from './sanitize-coord';
import type { Coord, Point, TriangleCoordinates } from './types';

import incenter from 'triangle-incenter';

export const computeIncenter = (coordinates: TriangleCoordinates): Point => {
	const coords = incenter([
		[sanitizeCoord(coordinates[0]), sanitizeCoord(coordinates[1])],
		[sanitizeCoord(coordinates[2]), sanitizeCoord(coordinates[3])],
		[sanitizeCoord(coordinates[4]), sanitizeCoord(coordinates[5])]
	]) as [Coord, Coord];

	return [coords[0], coords[1]];
};
