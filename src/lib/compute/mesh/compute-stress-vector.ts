import type { StressVector, Triangle } from './types';

export const computeTriangleStressVector = (
	triangle: Pick<Triangle, 'coordinates' | 'incenter'>
): StressVector => {
	// TODO use perlin noise using incenter?
	return {
		value: Math.random()
	};
};
