export const HEIGHT = 800;
export const WIDTH = 800;

const MIN_X = 0;
const MIN_Y = 0;
const MAX_X = WIDTH;
const MAX_Y = HEIGHT;

type Pixel = {
	hue: number; // degree
	lightness: number; // percent
};

type Point = {
	x: number;
	y: number;
};

const gaussianRandom = (mean = 0, stdev = 1) => {
	const u = 1 - Math.random(); // converting [0, 1) to (0, 1]
	const v = Math.random();
	const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
	return z * stdev + mean;
};

export const getRandomPoints = (nb: number): Point[] => {
	if (nb <= 0) {
		return [];
	}

	const foo = 2;

	const arr: Point[] = [];
	for (let i = 0; i < nb - 1; i++) {
		const x = Math.random() * (MAX_X - MIN_X);
		const y = Math.random() * (MAX_Y - MIN_Y);
		// const x = gaussianRandom(0, (MAX_X - MIN_X) / foo);
		// const x = gaussianRandom((MAX_X - MIN_X) / 2, (MAX_X - MIN_X) / foo);
		// const y = gaussianRandom(0, (MAX_Y - MIN_Y) / foo);
		// const y = gaussianRandom((MAX_Y - MIN_Y) / 2, (MAX_Y - MIN_Y) / foo);
		arr.push({ x, y });
	}

	return arr;
};

const MAX_DISTANCE_TO_ORIGIN = WIDTH ** 2 + HEIGHT ** 2;

const ratioToHue = (ratio: number) => {
	const hue = Math.floor(ratio * 360);
	// add random offset for fun
	// hue += Math.random() * 50 - 25;

	return hue;
};

export const getColor = ({
	point,
	distanceToNearest,
	lightnessOffset,
	lightnessRatio
}: {
	point: Point;
	distanceToNearest: number;
	lightnessOffset: number;
	lightnessRatio: number;
}): Pick<Pixel, 'hue' | 'lightness'> => {
	// squared to save compute
	const distanceToOrigin = point.x ** 2 + point.y ** 2;

	const lightness = (distanceToNearest - lightnessOffset) * lightnessRatio;
	return {
		lightness: Math.min(lightness, 100),
		// hue: ratioToHue(distanceToOrigin / MAX_DISTANCE_TO_ORIGIN)
		hue: ratioToHue((distanceToNearest * 0.001) % 360)
	};
};

export const distanceSquared = (p1: Point, p2: Point) => {
	return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
};

export type VoronoiGridPos = {
	u: number;
	v: number;
};

export class VoronoiGrid {
	constructor(private seed: Point[]) {}

	getNearestPoint(point: Point): Point {
		/**
		 * We loop over seed points but no need to loop other all of them.
		 * The nearest point is either in the same square or in any adjacent one
		 */
		const candidates = this.seed;
		const first = candidates.at(0);
		if (!first) {
			console.error('no adjacent points: recursive lookup NOT YET IMPLEMENTED');
			return { x: 0, y: 0 }; // ! FIXME
			// throw new Error('no adjacent points: recursive lookup NOT YET IMPLEMENTED');
		}
		let nearest: Point = first;
		let minDistance: number = distanceSquared(point, first);

		for (const candidate of candidates) {
			const d = distanceSquared(point, candidate);
			if (d < minDistance) {
				nearest = candidate;
				minDistance = d;
			}
		}

		return nearest;
	}
}
