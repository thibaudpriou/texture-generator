import type { Coord } from './types';

export const sanitizeCoord = (coord: Coord) => Number(coord.toPrecision(3));
