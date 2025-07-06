<script lang="ts">
	import { Button, Slider } from 'carbon-components-svelte';
	import {
		distanceSquared,
		getColor,
		getRandomPoints,
		HEIGHT,
		VoronoiGrid,
		WIDTH
	} from './voronoi';
	import convert from 'color-convert';

	const createPixels = (
		elt: HTMLCanvasElement | undefined,
		grid: VoronoiGrid,
		lightnessOffset: number,
		lightnessRatio: number
	) => {
		if (!elt) {
			return;
		}

		const ctx = elt.getContext('2d', { alpha: false });
		if (!ctx) {
			console.error('oops getContext failed');
			return;
		}

		const canvasWidth = elt.width;
		const imageData = ctx.getImageData(0, 0, canvasWidth, elt.height);

		const buf = new ArrayBuffer(imageData.data.length);
		const buf8 = new Uint8ClampedArray(buf);
		const data = new Uint32Array(buf);

		const computeStart = new Date().valueOf();
		for (let y = 0; y < HEIGHT - 1; y++) {
			for (let x = 0; x < WIDTH - 1; x++) {
				const p = { x, y };
				const nearest = grid.getNearestPoint(p);
				const distanceToNearest = Math.sqrt(distanceSquared(nearest, p));
				const { hue, lightness } = getColor({
					point: nearest,
					distanceToNearest,
					lightnessOffset,
					lightnessRatio
				});

				const [red, green, blue] = convert.hsl.rgb([hue, 100, lightness]);
				// alpha blue green red
				data[y * canvasWidth + x] = (255 << 24) | (blue << 16) | (green << 8) | red;
			}
		}

		imageData.data.set(buf8);
		ctx.putImageData(imageData, 0, 0);
		console.debug(`finished computing in ${new Date().valueOf() - computeStart}ms`);
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
