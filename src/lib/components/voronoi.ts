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

export const getRandomPoints = (nb: number): Point[] => {
	if (nb <= 0) {
		return [];
	}

	const arr: Point[] = [];
	for (let i = 0; i < nb - 1; i++) {
		const x = Math.random() * (MAX_X - MIN_X);
		const y = Math.random() * (MAX_Y - MIN_Y);
		arr.push({ x, y });
	}

	return arr;
};

const MAX_DISTANCE_TO_ORIGIN = Math.sqrt(WIDTH ** 2 + HEIGHT ** 2);

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
	const distanceToOrigin = Math.sqrt(point.x ** 2 + point.y ** 2);

	const lightness = (distanceToNearest - lightnessOffset) * lightnessRatio;
	return {
		lightness: Math.min(lightness, 100),
		hue: Math.floor((distanceToOrigin / MAX_DISTANCE_TO_ORIGIN) * 360)
	};
};

export const distance = (p1: Point, p2: Point) => {
	return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

export type VoronoiGridPos = {
	u: number;
	v: number;
};

export class VoronoiGrid {
	private map: Map<string, Point[]>;
	// each square is 100px x 100px
	private size = 100;

	constructor(private seed: Point[]) {
		this.map = new Map<string, Point[]>();

		seed.forEach((point) => {
			const pos = this.getSquarePos(point);
			this.addPoint(pos, point);
		});
	}

	getNearestPoint(point: Point): Point {
		/**
		 * We loop over seed points but no need to loop other all of them.
		 * The nearest point is either in the same square or in any adjacent one
		 */
		const candidates = this.getAdjacentPoints(point);
		const first = candidates.at(0);
		if (!first) {
			console.error('no adjacent points: recursive lookup NOT YET IMPLEMENTED');
			return { x: 0, y: 0 }; // ! FIXME
			// throw new Error('no adjacent points: recursive lookup NOT YET IMPLEMENTED');
		}
		let nearest: Point = first;
		let minDistance: number = distance(point, first);

		candidates.forEach((candidate) => {
			const d = distance(point, candidate);
			if (d < minDistance) {
				nearest = candidate;
				minDistance = d;
			}
		});

		return nearest;
	}

	getPoints(pos: VoronoiGridPos): Point[] {
		const key = this.getKey(pos);
		return this.map.get(key) ?? [];
	}

	private addPoint(pos: VoronoiGridPos, newPoint: Point) {
		const key = this.getKey(pos);
		const found = this.map.get(key) ?? [];
		this.map.set(key, [...found, newPoint]);
	}

	private getKey(pos: VoronoiGridPos) {
		return `${pos.u}:${pos.v}`;
	}

	private getSquarePos(p: Point): VoronoiGridPos {
		return {
			u: Math.ceil(p.x / this.size),
			v: Math.ceil(p.y / this.size)
		};
	}

	private getAdjacentPoints(point: Point): Point[] {
		// ! FIXME: maximum call stack exceeded Y = 1
		// const pos = this.getSquarePos(point);
		// const points = this.getPoints(pos);

		// for (let u = Math.max(pos.u - 1, 0); u <= pos.u + 1; u++) {
		// 	for (let v = Math.max(pos.v - 1, 0); v <= pos.v + 1; v++) {
		// 		points.push(...this.getPoints(pos));
		// 	}
		// }

		// return points;

		return this.seed;
	}
}
