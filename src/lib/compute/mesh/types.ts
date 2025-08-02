export type Coord = number;
export type Point = [Coord, Coord];
export type PointHash = `${Point[0]}-${Point[1]}`;

export type TriangleCoordinates = [Coord, Coord, Coord, Coord, Coord, Coord]; // v1.x, v1.y, v2.x, v2.y, v3.x, v3.y
export type Triangle = {
	id: string;
	coordinates: TriangleCoordinates;
	incenter: [Coord, Coord];
};
