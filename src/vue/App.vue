<script setup>
  import '../scss/Global.scss';
  import { onMounted, ref } from 'vue';
  import Card from './Card.vue';
  import Loading from './Loading.vue';
  import { Loop } from '../js/Loop.js';
  import { Graphics } from '../js/Graphics.js';
  import { AssetLoader } from '../js/loaders/AssetLoader.js';

  // Initialize components
  var canvas = ref();
  var loop;
  var graphics;
  var assets;

  function onLoad() {
    loop.add(render, -1); // Add render loop
  }

  function render() {
    this.graphics.render();
  }

  // Redirect app after loading
  onMounted(function() {
    //location.replace('v1/index.html')
    loop = new Loop();
    graphics = new Graphics(canvas.value);
    assets = new AssetLoader(onLoad)
    assets.load({
      models: '../json/menu-models.json',
      textures: '../json/menu-textures.json',
      audio: '../json/menu-audio.json',
    })
  });
</script>

<template>
  <canvas ref="canvas"></canvas>
  <div class="cards">
    <Card :src="'../svg/button-play.svg'" :text="'Classic'"></Card>
    <Card :src="'../svg/button-play-pro.svg'" :text="'Pro'"></Card>
  </div>
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