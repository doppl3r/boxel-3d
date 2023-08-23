<script setup>
	import '../scss/style.scss';
	import { ref, onMounted } from 'vue';
	import { App } from '../js/App.js';

	// Initialize app and expose to window scope
	var canvas = ref();
	var app = window.app = new App();

	onMounted(function() {
		app.init(canvas.value);
	});
</script>

<template>
	<canvas ref="canvas"></canvas>
	<div class="ui"></div>
</template>