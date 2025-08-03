export type Coord = number;

/** [ v1.x, v1.y ] */
export type Point = [Coord, Coord];
export type PointHash = `${Point[0]}-${Point[1]}`;

/** [ v1.x, v1.y, v2.x, v2.y, v3.x, v3.y ] */
export type TriangleCoordinates = [Coord, Coord, Coord, Coord, Coord, Coord];
export type TriangleId = string;
export type Triangle = {
	id: TriangleId;
	coordinates: TriangleCoordinates;
	incenter: Point;
	stressVector: StressVector;
};

export type TrianglesById = Record<TriangleId, Triangle>;
export type TrianglesByNodes = Record<PointHash, Record<TriangleId, true>>;

export type StressVector = {
	/** normalized value [0, 1[ */
	value: number;

	isCracked?: boolean;
};

export type ComputeStressFn = (
	triangle: Pick<Triangle, 'coordinates' | 'incenter'>
) => StressVector;
