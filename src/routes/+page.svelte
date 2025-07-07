<script lang="ts">
	import 'carbon-components-svelte/css/white.css';
	import Voronoi from '$lib/components/Voronoi.svelte';
	// import Mesh from '$lib/components/Mesh.svelte';

	// import Scene from '$lib/components/Scene.svelte';
	// import { Canvas } from '@threlte/core';
</script>

<div class="container">
	<!-- <Canvas>
		<Scene />
	</Canvas> -->

	<!-- <Mesh /> -->
	<Voronoi />
</div>

<style>
	.container {
		height: 100%;
		padding: 1em;
	}
</style>
