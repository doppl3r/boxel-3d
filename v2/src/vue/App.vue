<script setup>
  import '../scss/Global.scss';
  import { onMounted, ref } from 'vue';
  import { Game } from '../js/Game.js';
  import Loading from './Loading.vue';

  // Initialize app and expose to window scope
  var canvas = ref();
  var game = window.game = new Game();

  // Initialize app after canvas has been mounted
  onMounted(function() {
    game.init(canvas.value);
  });
</script>

<template>
  <canvas ref="canvas"></canvas>
  <RouterView />
  <Loading />
</template>

<style lang="scss" scoped>
  canvas {
    image-rendering: pixelated;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
  }
</style>