<script lang="ts">
	import { Button, Slider } from 'carbon-components-svelte';
	import { distance, getColor, getRandomPoints, HEIGHT, VoronoiGrid, WIDTH } from './voronoi';

	const createPixels = (
		elt: HTMLCanvasElement | undefined,
		grid: VoronoiGrid,
		lightnessOffset: number,
		lightnessRatio: number
	) => {
		if (!elt) {
			return;
		}

		const ctx = elt.getContext('2d');
		if (!ctx) {
			console.error('oops getContext failed');
			return;
		}

		// points.forEach(({ x, y }) => {
		// 	const { hue, lightness } = getColor({ x: 0, y: 0 });
		// 	ctx.fillStyle = `hsl(${hue} 100% ${lightness}%)`;
		// 	ctx.fillRect(x, y, 50, 50);
		// });

		for (let y = 0; y < HEIGHT - 1; y++) {
			for (let x = 0; x < WIDTH - 1; x++) {
				const p = { x, y };
				const nearest = grid.getNearestPoint(p);
				const distanceToNearest = distance(nearest, p);
				const { hue, lightness } = getColor({
					point: nearest,
					distanceToNearest,
					lightnessOffset,
					lightnessRatio
				});
				ctx.fillStyle = `hsl(${hue} 100% ${lightness}%)`;
				ctx.fillRect(x, y, 1, 1);
			}
		}
	};

	let canvasElt: HTMLCanvasElement | undefined;
	let lightnessOffset: number = 0;
	let lightnessRatio = 0.65;
	let nbSeed = 100;

	$: points = getRandomPoints(nbSeed);
	$: grid = new VoronoiGrid(points);

	$: {
		createPixels(canvasElt, grid, lightnessOffset, lightnessRatio);
	}

	$: resetSeed = () => {
		points = getRandomPoints(nbSeed);
	};
</script>

<Slider
	labelText="Seed number"
	min={0}
	max={100}
	step={1}
	value={nbSeed}
	on:change={(ev) => {
		nbSeed = ev.detail;
	}}
/>
<Slider
	labelText="lightness offset"
	min={0}
	max={100}
	step={0.1}
	value={lightnessOffset}
	on:change={(ev) => {
		lightnessOffset = ev.detail;
	}}
/>
<Slider
	labelText="lightness ratio"
	min={0.4}
	max={0.8}
	step={0.05}
	value={lightnessRatio}
	on:change={(ev) => {
		lightnessRatio = ev.detail;
	}}
/>

<Button on:click={resetSeed}>reset seed</Button>

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
