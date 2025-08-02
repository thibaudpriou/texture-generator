<script lang="ts">
	import { createDelaunayMesh } from '$lib/compute/mesh/create-delaunay-mesh';
	import { computeIncenter } from '$lib/compute/mesh/compute-incenter';
	import type { Triangle, Point } from '$lib/compute/mesh/types';

	const WIDTH = 500;
	const HEIGHT = 500;
	const NB_POINTS = 500;

	let canvasElt: HTMLCanvasElement | undefined;

	const coordToPoints = (coordinates: Triangle['coordinates']): [Point, Point, Point] => {
		return [
			[coordinates[0], coordinates[1]],
			[coordinates[2], coordinates[3]],
			[coordinates[4], coordinates[5]]
		];
	};

	const drawLine = (ctx: CanvasRenderingContext2D, p1: Point, p2: Point) => {
		ctx.beginPath();
		ctx.moveTo(p1[0], p1[1]);
		ctx.lineTo(p2[0], p2[1]);
		ctx.closePath();
		ctx.stroke();
	};

	const drawTriangles = (elt: HTMLCanvasElement | undefined, triangles: Triangle[]) => {
		if (!elt) {
			return;
		}

		const ctx = elt.getContext('2d', { alpha: false });
		if (!ctx) {
			console.error('oops getContext failed');
			return;
		}

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, WIDTH, HEIGHT);

		for (const triangle of triangles) {
			const { coordinates, incenter } = triangle;

			ctx.strokeStyle = 'black';
			const points = coordToPoints(coordinates);
			ctx.beginPath();
			ctx.moveTo(...points[0]);
			ctx.lineTo(...points[1]);
			ctx.lineTo(...points[2]);
			ctx.closePath();
			ctx.stroke();

			// draw incenters
			ctx.strokeStyle = 'lightblue';
			drawLine(ctx, incenter, points[0]);
			drawLine(ctx, incenter, points[1]);
			drawLine(ctx, incenter, points[2]);
		}
	};

	const delaunayTrianglesCoordinates = createDelaunayMesh(WIDTH, HEIGHT, NB_POINTS);

	const triangles: Triangle[] = [];
	const pointsByTriangles: Record<`${Point[0]}-${Point[1]}`, Record<Triangle['id'], true>> = {};
	for (const id in delaunayTrianglesCoordinates) {
		const coordinates = delaunayTrianglesCoordinates[id];
		const triangle = {
			id,
			coordinates,
			incenter: computeIncenter(coordinates)
		};

		triangles.push(triangle);
		const points = coordToPoints(coordinates);

		// generate index for easy processing in the future
		const p1Index = `${points[0][0]}-${points[0][1]}` as const;
		const p2Index = `${points[1][0]}-${points[1][1]}` as const;
		const p3Index = `${points[2][0]}-${points[2][1]}` as const;
		if (!pointsByTriangles[p1Index]) {
			pointsByTriangles[p1Index] = {};
		}
		pointsByTriangles[p1Index][p1Index] = true;
		if (!pointsByTriangles[p2Index]) {
			pointsByTriangles[p2Index] = {};
		}
		pointsByTriangles[p2Index][p2Index] = true;
		if (!pointsByTriangles[p3Index]) {
			pointsByTriangles[p3Index] = {};
		}
		pointsByTriangles[p3Index][p3Index] = true;
	}

	$: {
		drawTriangles(canvasElt, triangles);
	}
</script>

<div class="canvas-container">
	<canvas width={WIDTH} height={HEIGHT} bind:this={canvasElt}></canvas>
</div>

<style>
	.canvas-container {
		margin-top: 1em;
	}

	.canvas-container > canvas {
		border: 1px solid black;
	}
</style>
