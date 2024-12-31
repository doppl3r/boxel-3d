<script setup>
  import '@/v2/src/scss/Global.scss';
  import { onMounted, ref } from 'vue';
  import Banner from './Banner.vue';
  import ButtonFullscreen from './ButtonFullscreen.vue';
  import ButtonVolume from './ButtonVolume.vue';
  import Card from './Card.vue';
  import Modal from '@/v2/src/vue/Modal.vue';
  import Loading from '@/v2/src/vue/Loading.vue';
  import { Ticker } from '@/v2/src/js/core/Ticker.js';
  import { Graphics } from '@/v2/src/js/core/Graphics.js';
  import { LightFactory } from '@/v2/src/js/core/factories/LightFactory.js';
  import { AssetLoader } from '@/v2/src/js/core/loaders/AssetLoader.js';

  // Initialize components
  var canvas = ref();
  var ticker;
  var graphics;
  var assets;
  var background;
  var light;

  function onLoad() {
    // Initialize 3D objects
    background = assets.get('background-island-night');
    light = LightFactory.create('AmbientLight');

    // Update camera and scene
    background.traverse(function(child) { if (child.isCamera) graphics.setCamera(child); });
    graphics.setSize(window.innerWidth, window.innerHeight);
    graphics.scene.add(background, light);

    // Start render loop
    ticker.add(render, -1);
    ticker.start();
  }

  function render(data) {
    background.mixer.update(data.delta)
    graphics.render();
  }

  function openLink(url, target = '_self') {
    window.open(url, target);
  }

  function openModal() {
    // Dispatch new modal from event
    window.dispatchEvent(new CustomEvent('openModal', {
      detail: {
        title: 'News & Events',
        text: 'Boxel 3D is coming soon to Steam in early 2025!\n\nWishlist on Steam today!',
        inputs: [
          {
            type: 'button',
            value: 'View Steam Page',
            callback: function() {
              openLink('https://store.steampowered.com/app/3208440/Boxel_3D/', '_blank');
              window.dispatchEvent(new CustomEvent('closeModal'));
            }
          }
        ]
      }
    }));
  }

  // Redirect app after loading
  onMounted(function() {
    ticker = new Ticker();
    graphics = new Graphics(canvas.value);
    assets = new AssetLoader(onLoad);
    assets.load({
      models: './json/menu-models.json',
      textures: './json/menu-textures.json',
      audio: './json/menu-audio.json',
    });
  });
</script>

<template>
  <canvas ref="canvas"></canvas>
  <div class="ui">
    <div class="actions">
      <ButtonVolume />
      <ButtonFullscreen />
    </div>
    <Banner>Boxel 3D</Banner>
    <div class="cards">
      <Card :src="'./svg/button-play-steam.svg'" @click="openModal()">News</Card>
      <Card :src="'./svg/button-play.svg'" @click="openLink('./v1/index.html')">Play</Card>
    </div>
    <Modal />
    <Loading />
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

  .ui {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 1em;
    height: 100%;
    justify-content: center;
    position: relative;
    width: 100%;

    .actions {
      display: flex;
      gap: 0.5em;
      left: 1em;
      position: absolute;
      top: 1em;
    }
  }

  .cards {
    align-items: center;
    display: flex;
    gap: 1em;
    justify-content: center;
    position: relative;
  }
</style>