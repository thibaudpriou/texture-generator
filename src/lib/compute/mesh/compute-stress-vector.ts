import type { StreeVector, Triangle } from './types';

export const computeTriangleStressVector = (
	triangle: Pick<Triangle, 'coordinates' | 'incenter'>
): StreeVector => {
	// TODO use perlin noise using incenter?
	return Math.random();
};
