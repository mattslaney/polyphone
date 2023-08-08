<script lang="ts">
	import type { SimpleUserDelegate } from 'sip.js/lib/platform/web';
	import { SimplePhone } from '../utils/phone_util';
	import type { Line } from '../utils/phone_util';
	import { LineStore } from '../store';
	import { get } from 'svelte/store';

	export let line: Line;

	const setStatus = (status: string) => {
		line.status = status;
		LineStore.update((lines) => lines);
	};

	const toggleActive = async () => {
		switch (line.status) {
			case 'connected':
			case 'registered':
				setStatus(line.status);
				break;
			case 'ringing':
				await line.phone?.answer();
				break;
			default:
				break;
		}
	};

	const toggleRegistration = async () => {
		if (line.status === 'unregistered') {
			line.phone = new SimplePhone(line);
			const simpleUserDelegate: SimpleUserDelegate = {
				onCallCreated: (): void => {
					console.log(`%cCall created: ${line.username}`, 'color: green');
					setStatus('connected');
				},
				onCallAnswered: (): void => {
					console.log(`%cCall answered: ${line.username}`, 'color: green');
					setStatus('connected');
				},
				onCallHangup: (): void => {
					console.log(`%cCall hangup: ${line.username}`, 'color: green');
					setStatus('registered');
				},
				onCallHold: (held: boolean): void => {
					console.log(`%cCall hold ${held}: ${line.username}`, 'color: green');
					setStatus('connected');
				},
				onCallReceived: () => {
					console.log(`%cIncoming Call for ${line.username}!`, 'color: green');
					new Audio('ring.wav').play();
					setStatus('ringing');
				}
			};
			try {
				setStatus('connecting');
				await line.phone?.register(simpleUserDelegate);
			} catch (e) {
				console.log(`%cFailed to register for ${line.username}!`, 'color: red');
				M.toast({ html: `Failed to register for ${line.username}!` });
				setStatus('error');
				return;
			}
			setStatus('registered');
		} else {
			try {
				setStatus('disconnecting');
				line.phone?.unregister();
			} catch (e) {
				setStatus('error');
				console.log(`%cFailed to unregister for ${line.username}!`, 'color: red');
			}
			setStatus('unregistered');
		}
	};

	const handleContextMenu = () => {
		console.log('ToDo: Add configuration');
	};
</script>

<button
	on:dblclick={toggleRegistration}
	on:click={toggleActive}
	on:contextmenu|preventDefault={handleContextMenu}
	title="sip:{line.username}@{line.server}"
	class="btn line {['disconnecting', 'connecting'].includes(line.status)
		? 'deep-orange lighten-1'
		: ['connected', 'active'].includes(line.status)
		? 'green'
		: ['registered'].includes(line.status)
		? 'green lighten-1'
		: ['ringing'].includes(line.status)
		? 'red lighten-2'
		: ['error'].includes(line.status)
		? 'red'
		: 'grey lighten-1'}"
>
	{line.name || line.username}
	<i class="material-icons"
		>{line.status === 'ringing'
			? 'ring_volume'
			: line.status === 'connected'
			? 'call'
			: 'call_end'}</i
	></button
>

<!-- <button
	on:click={toggleActive}
	class="btn {registered ? '' : 'grey'} {ringing ? 'red' : ''} {active ? 'green' : ''}"
	><i class="material-icons">{ringing ? 'ring_volume' : active ? 'call' : 'call_end'}</i></button
> -->

<style>
	.btn > .material-icons {
		border: none;
		background: none;
		color: white;
		font-size: 1rem;
	}
	.btn.line {
		width: 100%;
		margin: 2px;
	}
</style>
