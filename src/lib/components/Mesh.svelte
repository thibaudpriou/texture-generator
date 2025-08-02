<script lang="ts">
	import { createDelaunayMesh } from '$lib/compute/mesh/create-delaunay-mesh';
	import { computeIncenter } from '$lib/compute/mesh/compute-incenter';
	import type { Triangle, Point } from '$lib/compute/mesh/types';
	import { coordToPoints } from '$lib/compute/mesh/coord-to-points';
	import { prepareTriangle } from '$lib/compute/mesh/prepare-triangle';

	const WIDTH = 500;
	const HEIGHT = 500;
	const NB_POINTS = 500;

	let canvasElt: HTMLCanvasElement | undefined;

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

	const { nodesByTriangles, triangles } = prepareTriangle(WIDTH, HEIGHT, NB_POINTS);
	/**
	 * TODO generate cracks with the following algorithm
	 * - loop on nodes
	 * - compute force applied by each triangles. Should include: stress, distance with incenter, direction?
	 * - generate crack
	 * 		- split node into multiple nodes, then generate new triangles
	 * 		- add some stress vector on those (or none, idk)
	 */

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
