<script setup>
	import '../scss/style.scss';
	import { ref, onMounted } from 'vue';
	import { App } from '../js/App.js';

	// Initialize app and expose to window scope
	var canvas = ref();
	var app = window.app = new App();

	console.log(app);

	onMounted(function() {
		//game.init(canvas.value);
	});
</script>

<template>
	<canvas ref="canvas"></canvas>
	<div class="ui"></div>
</template>