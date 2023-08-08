<script>
	import { onMount } from 'svelte';
	import 'materialize-css/dist/css/materialize.min.css';
	import 'material-icons/iconfont/material-icons.css';
	import { LineStore } from '../store';
	import Dialpad from './dialpad.svelte';
	import Line from './line.svelte';
	import Linecontrol from './linecontrol.svelte';
	import Player from './player.svelte';

	onMount(() => {
		import('materialize-css').then(() => {
			M.AutoInit();
			const modalElems = document.querySelectorAll('.modal');
			M.Modal.init(modalElems);
		});
	});
</script>

<div class="row">
	<div class="sidebar col s2">
		{#each $LineStore as line (line.id)}
			<Line {line} />
		{/each}
		<Linecontrol />
	</div>
	<div class="centre col s10">
		{#each $LineStore as line (line.id)}
			<Dialpad bind:line />
		{/each}
	</div>
</div>

<style>
	.row {
		height: 100%;
	}
	.sidebar {
		height: 100%;
		background-color: #f0f0f0;
		border-right: 1px solid #ccc;
		border-left: 1px solid #ccc;
		padding-top: 25px;
	}
	.centre {
		display: flex;
		flex-wrap: wrap;
		grid-template-columns: auto auto auto;
		padding-top: 25px;
	}
</style>
