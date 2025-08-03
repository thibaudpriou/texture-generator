import type { Triangle } from './types';

/**
 * Return a deterministic triangle Id given points coordinates
 */
export const getTriangleId = ({ incenter }: Pick<Triangle, 'incenter'>) => {
	return `triangle-${incenter[0]}-${incenter[1]}`;
};
