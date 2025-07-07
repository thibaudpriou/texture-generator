<script lang="ts">
	import { createDelaunayMesh } from '$lib/compute/mesh/create-delaunay-mesh';
	import type { Triangle } from '$lib/compute/mesh/types';
	import { log } from 'three/tsl';

	const WIDTH = 500;
	const HEIGHT = 500;
	const NB_POINTS = 500;

	const delaunayTriangles = createDelaunayMesh(WIDTH, HEIGHT, NB_POINTS);

	let canvasElt: HTMLCanvasElement | undefined;

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

		ctx.strokeStyle = 'black';
		for (const triangle of triangles) {
			ctx.beginPath();
			ctx.moveTo(triangle[0], triangle[1]);
			ctx.lineTo(triangle[2], triangle[3]);
			ctx.lineTo(triangle[4], triangle[5]);
			ctx.closePath();
			ctx.stroke();
		}
	};

	$: {
		drawTriangles(canvasElt, delaunayTriangles);
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
