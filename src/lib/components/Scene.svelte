<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { DoubleSide, PlaneGeometry } from 'three';

	const geometry = new PlaneGeometry(10, 10, 100, 100);
	const positions = geometry.getAttribute('position');
	const noise = (x: number, y: number) => Math.random();

	$effect(() => {
		for (let i = 0; i < positions.count; i += 1) {
			const x = positions.getX(i);
			const y = positions.getY(i);
			positions.setZ(i, noise(x, y));
		}
		positions.needsUpdate = true;
		// needed for lighting
		geometry.computeVertexNormals();
	});
</script>

<T.PerspectiveCamera makeDefault position={10}>
	<OrbitControls />
</T.PerspectiveCamera>

<T.Mesh {geometry} rotation.x={-1 * 0.5 * Math.PI}>
	<T.MeshStandardMaterial side={DoubleSide} />
</T.Mesh>
