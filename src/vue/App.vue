<script setup>
  import '../scss/Global.scss';
  import { onMounted, ref } from 'vue';
  import Card from './Card.vue';

  // Initialize components
  var canvas = ref();

  // Redirect app after loading
  onMounted(function() {
    //location.replace('v1/index.html')
  });
</script>

<template>
  <canvas ref="canvas"></canvas>
  <div class="cards">
    <Card :src="'../svg/button-play.svg'" :text="'Classic'"></Card>
    <Card :src="'../svg/button-play-pro.svg'" :text="'Pro'"></Card>
  </div>
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

  .cards {
    align-items: center;
    display: flex;
    gap: 1em;
    height: 100%;
    justify-content: center;
    position: relative;
    width: 100%;
  }
</style>