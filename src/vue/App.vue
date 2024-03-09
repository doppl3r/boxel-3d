<script setup>
  import '../scss/App.scss';
  import { ref, onMounted } from 'vue';
  import { App } from '../js/App.js';
  import UI from './UI.vue';

  // Initialize app and expose to window scope
  var canvas = ref();
  var app = window.app = new App();

  // Initialize app after canvas has been mounted
  onMounted(function() {
    app.init(canvas.value);
  });
</script>

<template>
  <canvas ref="canvas"></canvas>
  <UI />
</template>