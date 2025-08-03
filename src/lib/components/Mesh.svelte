<script lang="ts">
	import type { Triangle, Point, TrianglesById } from '$lib/compute/mesh/types';
	import { coordToPoints } from '$lib/compute/mesh/coord-to-points';
	import { prepareTriangles } from '$lib/compute/mesh/prepare-triangles';
	import { computeTriangleStressVector } from '$lib/compute/mesh/compute-stress-vector';
	import { simulateCracks } from '$lib/compute/mesh/simulate-cracks';
	import Page from '../../routes/+page.svelte';

	const WIDTH = 500;
	const HEIGHT = 500;
	const NB_POINTS = 10;

	let canvasElt: HTMLCanvasElement | undefined;

	const drawLine = (ctx: CanvasRenderingContext2D, p1: Point, p2: Point) => {
		ctx.beginPath();
		ctx.moveTo(p1[0], p1[1]);
		ctx.lineTo(p2[0], p2[1]);
		ctx.closePath();
		ctx.stroke();
	};

	const drawTriangles = (elt: HTMLCanvasElement | undefined, trianglesById: TrianglesById) => {
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

		for (const triangleId in trianglesById) {
			const triangle = trianglesById[triangleId];
			const { coordinates, incenter, stressVector } = triangle;

			ctx.strokeStyle = 'black';
			const points = coordToPoints(coordinates);
			ctx.beginPath();
			ctx.moveTo(...points[0]);
			ctx.lineTo(...points[1]);
			ctx.lineTo(...points[2]);
			ctx.closePath();
			ctx.stroke();

			// draw incenters
			// const isCracked = stressVector === 0; // ! DEBUG
			// if (!isCracked) continue; // ! DEBUG ONLY
			// ctx.strokeStyle = isCracked ? 'red' : 'lightblue';
			// drawLine(ctx, incenter, points[0]);
			// drawLine(ctx, incenter, points[1]);
			// drawLine(ctx, incenter, points[2]);
		}
	};

	let data = prepareTriangles({
		width: WIDTH,
		height: HEIGHT,
		nbPoints: NB_POINTS,
		getStressVector: computeTriangleStressVector
	});

	let nbSimulation = 0;

	$: createCracks = () => {
		data = simulateCracks(data, ++nbSimulation);
	};

	/**
	 * TODO generate cracks with the following algorithm
	 * - loop on nodes
	 * - compute force applied by each triangles. Should include: stress, distance with incenter, direction?
	 * - generate crack
	 * 		- split node into multiple nodes, then generate new triangles
	 * 		- add some stress vector on those (or none, idk)
	 */

	$: {
		drawTriangles(canvasElt, data.trianglesById);
	}
</script>

<div class="canvas-container">
	<canvas width={WIDTH} height={HEIGHT} bind:this={canvasElt}></canvas>
	<button on:click={createCracks}>create cracks (simulation #{nbSimulation + 1})</button>
</div>

<style>
	.canvas-container {
		margin-top: 1em;
	}

	.canvas-container > canvas {
		border: 1px solid black;
	}
</style>
