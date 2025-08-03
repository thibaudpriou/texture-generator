import { sanitizeCoord } from './sanitize-coord';
import type { Coord } from './types';

export const generatePointsCoordinates = ({
	width,
	height,
	nbPoints
}: {
	width: number;
	height: number;
	nbPoints: number;
}): Coord[] => {
	const points: Coord[] = [0, 0, width, 0, width, height, 0, height]; // 2 subsequent coord for a point
	for (let i = 0; i < (nbPoints - 1) * 2; i++) {
		const x = sanitizeCoord(Math.random() * width);
		const y = sanitizeCoord(Math.random() * height);
		points.push(x, y);
	}

	return points;
};
