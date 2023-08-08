<script lang="ts">
	import { onMount } from 'svelte';
	import type { Line } from '../utils/phone_util';
	export let line: Line;
	let target = '';
	let visualiser: HTMLCanvasElement;

	$: line.status, onStatusChange();
	function onStatusChange() {
		try {
			if (line.status === 'connected') visualise();
		} catch (e) {
			console.error(e);
		}
	}

	const handleKeyClick = (e: Event) => {
		const key = <HTMLElement>e.target;
		target += key.innerText;
		if (line && line.status == 'connected') line.phone?.press(key.innerText);
	};

	async function handleCall() {
		let user = target;
		let server = line.server;
		if (target.indexOf('@') > -1) {
			user = target.split('@')[0].replace('sip:', '');
			server = target.split('@')[1] || line.server;
		}
		switch (line.status) {
			case 'registered':
				console.log('calling ' + `sip:${user}@${server}`);
				await line.phone?.call(`sip:${user}@${server}`);
				break;
			case 'ringing':
				line.phone?.answer();
				break;
			case 'connected':
				line.phone?.hangup();
				break;
		}
	}

	function handleMute() {
		line.phone?.mute();
	}

	function handleHold() {
		line.phone?.hold();
	}

	function visualise() {
		let WIDTH = 400;
		let HEIGHT = 100;

		const canvas = <HTMLCanvasElement>visualiser;
		const canvasCtx = <CanvasRenderingContext2D>canvas?.getContext('2d');
		const audioCtx = new AudioContext();
		const analyser = audioCtx.createAnalyser();
		let remoteStream = line.phone?.getRemoteStream();
		const source = audioCtx.createMediaStreamSource(<MediaStream>remoteStream);
		source.connect(analyser);

		analyser.fftSize = 2048;
		const bufferLength = analyser.fftSize;

		const dataArray = new Uint8Array(bufferLength);

		canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

		const draw = function () {
			requestAnimationFrame(draw);

			analyser.getByteTimeDomainData(dataArray);

			canvasCtx.fillStyle = 'rgb(255, 255, 255)';
			canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

			canvasCtx.lineWidth = 2;
			canvasCtx.strokeStyle = 'rgb(0, 180, 0)';

			canvasCtx.beginPath();

			const sliceWidth = (WIDTH * 1.0) / bufferLength;
			let x = 0;

			for (let i = 0; i < bufferLength; i++) {
				let v = dataArray[i] / 128.0;
				let y = (v * HEIGHT) / 2;

				if (i === 0) {
					canvasCtx.moveTo(x, y);
				} else {
					canvasCtx.lineTo(x, y);
				}

				x += sliceWidth;
			}

			canvasCtx.lineTo(canvas.width, canvas.height / 2);
			canvasCtx.stroke();
		};

		draw();
	}
</script>

{#if ['registered', 'ringing', 'connected'].includes(line.status)}
	<div class="keypad">
		<span class="name">{line.name}</span>
		<button on:click={handleKeyClick} class="btn key num grey">1</button>
		<button on:click={handleKeyClick} class="btn key num grey">2</button>
		<button on:click={handleKeyClick} class="btn key num grey">3</button>
		<button on:click={handleKeyClick} class="btn key num grey">4</button>
		<button on:click={handleKeyClick} class="btn key num grey">5</button>
		<button on:click={handleKeyClick} class="btn key num grey">6</button>
		<button on:click={handleKeyClick} class="btn key num grey">7</button>
		<button on:click={handleKeyClick} class="btn key num grey">8</button>
		<button on:click={handleKeyClick} class="btn key num grey">9</button>
		<button on:click={handleKeyClick} class="btn key num grey">*</button>
		<button on:click={handleKeyClick} class="btn key num grey">0</button>
		<button on:click={handleKeyClick} class="btn key num grey">#</button>
		<button on:click={handleHold} class="btn key grey"><i class="material-icons">pause</i></button>
		<button
			on:click={handleCall}
			class="btn key {['ringing'].includes(line.status)
				? 'deep-orange'
				: ['connected'].includes(line.status)
				? 'red'
				: 'green'}"
			><i class="material-icons">{line.status == 'ringing' ? 'ring_volume' : 'call'}</i></button
		>
		<button on:click={handleMute} class="btn key grey"><i class="material-icons">mic_off</i></button
		>
		<input id="target" class="dialnum" bind:value={target} />
		<canvas bind:this={visualiser} class="visualiser" />
	</div>
	<div />
{/if}

<style>
	.keypad {
		width: 200px;
		display: grid;
		grid-template-columns: auto auto auto;
		margin: 0 auto;
	}

	.btn.key {
		margin: 2px;
	}

	.name,
	.visualiser,
	.dialnum {
		grid-column-start: 1;
		grid-column-end: 4;
	}

	.visualiser {
		height: 100px;
	}
</style>
