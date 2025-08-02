import type { Point, PointHash } from './types';

export const hashPoint = (point: Point): PointHash => `${point[0]}-${point[1]}`;
