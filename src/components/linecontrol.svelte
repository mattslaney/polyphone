<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { LineStore } from '../store';
	import type { Modal } from 'materialize-css';

	let modal: Modal;
	let modalEl: HTMLDivElement;

	const exportStore = () => {
		const tempStore = get(LineStore);
		tempStore.forEach((line) => (line.phone = null));
		const filename = 'export.json';
		const jsonStr = JSON.stringify(tempStore);

		let element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	};

	const importStore = () => {
		let input = document.createElement('input');
		input.type = 'file';
		input.onchange = (event) => {
			if (!input.files || input.files.length === 0) return;
			let selectedFile = input.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				const text = reader.result?.toString().trim();
				LineStore.set(JSON.parse(<string>text));
			};
			reader.readAsText(selectedFile);
		};
		input.click();
	};

	const handleAdd = () => {
		modal.open();
	};

	const handleAddExt = () => {
		let unEl = <HTMLInputElement>modalEl.querySelector('#username');
		let pwEl = <HTMLInputElement>modalEl.querySelector('#password');
		let svrEl = <HTMLInputElement>modalEl.querySelector('#server');

		if (!unEl || !pwEl || !svrEl) return;

		let username = unEl.value;
		let password = pwEl.value;
		let server = svrEl.value;
		LineStore.update((lines) => [
			...lines,
			{
				id: lines.length + 1,
				name: username,
				username,
				password,
				server,
				status: 'unregistered',
				side: 'left',
				phone: null
			}
		]);
		modal.close();
	};
</script>

<main>
	<button data-target="modal1" id="new" class="btn modal-trigger">Add New</button>
	<button on:click={exportStore} id="export" class="btn">Export</button>
	<button on:click={importStore} id="import" class="btn">Import</button>
</main>
<!-- Modal Structure -->
<div bind:this={modalEl} id="modal1" class="modal" style="height: 350px">
	<div class="modal-content">
		<h4>Add New Extension</h4>
		<form class="col s12">
			<div class="row">
				<div class="input-field col s6">
					<input id="username" type="text" />
					<label for="username">Username</label>
				</div>
				<div class="input-field col s6">
					<input id="password" type="password" />
					<label for="password">Password</label>
				</div>
			</div>
			<div class="row">
				<div class="input-field col s12">
					<input id="server" type="text" />
					<label for="server">Server</label>
				</div>
			</div>
		</form>
	</div>
	<div class="modal-footer">
		<a href="#!" class="modal-close waves-effect waves-red btn-flat">Cancel</a>
		<a href="#!" on:click={handleAddExt} class="waves-effect waves-green btn-flat">Add</a>
	</div>
</div>

<style>
	main {
		display: grid;
		grid-template-columns: auto auto;
		position: fixed;
		bottom: 10px;
		width: 190px;
	}

	#new {
		grid-column-start: 1;
		grid-column-end: 3;
	}
</style>
