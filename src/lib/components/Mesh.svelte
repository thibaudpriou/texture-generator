<script lang="ts">
	import type { Triangle, Point, TrianglesById } from '$lib/compute/mesh/types';
	import { coordToPoints } from '$lib/compute/mesh/coord-to-points';
	import { prepareTriangles } from '$lib/compute/mesh/prepare-triangles';
	import { computeTriangleStressVector } from '$lib/compute/mesh/compute-stress-vector';
	import { simulateCracks } from '$lib/compute/mesh/simulate-cracks';
	import Page from '../../routes/+page.svelte';
	import { onMount } from 'svelte';

	const WIDTH = 500;
	const HEIGHT = 500;
	const NB_POINTS = 50;
	const GENERATION_SPEED = 50; // ms

	let canvasElt: HTMLCanvasElement | undefined;

	const drawLine = (ctx: CanvasRenderingContext2D, p1: Point, p2: Point) => {
		ctx.beginPath();
		ctx.moveTo(p1[0], p1[1]);
		ctx.lineTo(p2[0], p2[1]);
		ctx.closePath();
		ctx.stroke();
	};

	const drawTriangles = (
		elt: HTMLCanvasElement | undefined,
		trianglesById: TrianglesById,
		simulationNb: number
	) => {
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

			ctx.strokeStyle = stressVector.isCracked ? 'black' : 'black';
			const points = coordToPoints(coordinates);
			ctx.beginPath();
			ctx.moveTo(...points[0]);
			ctx.lineTo(...points[1]);
			ctx.lineTo(...points[2]);
			ctx.closePath();
			ctx.stroke();

			// draw incenters
			// if (!stressVector.isCracked) continue; // ! DEBUG ONLY
			// ctx.strokeStyle = 'lightblue';
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

	const createCracks = () => {
		++nbSimulation;
		data = simulateCracks(data);
	};

	/**
	 * TODO generate cracks with the following algorithm
	 * - loop on nodes
	 * - compute force applied by each triangles. Should include: stress, distance with incenter, direction?
	 * - generate crack
	 * 		- split node into multiple nodes, then generate new triangles
	 * 		- add some stress vector on those (or none, idk)
	 */

	let intervalId: ReturnType<typeof setInterval> | undefined = undefined;
	onMount(() => {
		// startCrackGeneration()
	});

	const startCrackGeneration = () => {
		intervalId = setInterval(createCracks, GENERATION_SPEED);
	};

	const stopCrackGeneration = () => {
		if (intervalId) {
			clearInterval(intervalId);
		}
		intervalId = undefined;
	};

	$: {
		drawTriangles(canvasElt, data.trianglesById, nbSimulation);
	}
</script>

<div class="canvas-container">
	<canvas width={WIDTH} height={HEIGHT} bind:this={canvasElt}></canvas>
	<div>
		<button on:click={createCracks} disabled={!!intervalId}
			>next (simulation #{nbSimulation + 1})</button
		>
	</div>
	<div>
		<button on:click={startCrackGeneration}>auto pattern generation</button>
		<button on:click={stopCrackGeneration}>stop</button>
	</div>
</div>

<style>
	.canvas-container {
		margin-top: 1em;
	}

	.canvas-container > canvas {
		border: 1px solid black;
	}
</style>
