<script setup>
  import '../scss/Global.scss';
  import { onMounted, ref } from 'vue';
  import Banner from './Banner.vue';
  import Card from './Card.vue';
  import Popup from '../../v2/src/vue/Popup.vue';
  import Loading from '../../v2/src/vue/Loading.vue';
  import { Loop } from '../../v2/src/js/Loop.js';
  import { Graphics } from '../../v2/src/js/Graphics.js';
  import { LightFactory } from '../../v2/src/js/factories/LightFactory.js';
  import { AssetLoader } from '../../v2/src/js/loaders/AssetLoader.js';

  // Initialize components
  var canvas = ref();
  var loop;
  var graphics;
  var assets;
  var background;
  var light;

  function onLoad() {
    // Initialize 3D objects
    background = assets.get('background-tropic');
    light = LightFactory.create('ambient');

    // Update camera and scene
    graphics.camera.position.set(0, 12, 16);
    graphics.camera.lookAt(0, -2, 0);
    graphics.scene.add(background, light);

    // Start render loop
    loop.add(render, -1);
    loop.start();
  }

  function render(data) {
    background.rotation.y = (Math.cos(data.index * 0.0025)) * 0.25;
    graphics.render();
  }

  function openLink(url) {
    window.open(url, '_self');
  }

  function openPopup() {
    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        title: 'Coming Soon!',
        text: 'Boxel 3D "Pro" is currently in development and will Be available in early 2025!',
        inputs: [
          {
            type: 'button',
            value: 'Continue',
            callback: function() {
              window.dispatchEvent(new CustomEvent('closePopup'));
            }
          }
        ]
      }
    }));
  }

  // Redirect app after loading
  onMounted(function() {
    //location.replace('v1/index.html')
    loop = new Loop();
    graphics = new Graphics(canvas.value);
    assets = new AssetLoader(onLoad)
    assets.load({
      models: './json/menu-models.json',
      textures: './json/menu-textures.json',
      audio: './json/menu-audio.json',
    })
  });
</script>

<template>
  <canvas ref="canvas"></canvas>
  <div class="ui">
    <Banner>Select Edition</Banner>
    <div class="cards">
      <Card :src="'./svg/button-play.svg'" :text="'Classic'" @click="openLink('./v1/index.html')"></Card>
      <Card :src="'./svg/button-play-pro.svg'" :text="'Pro'" @click="openPopup()"></Card>
    </div>
    <Popup />
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
  }

  .cards {
    align-items: center;
    display: flex;
    gap: 1em;
    justify-content: center;
    position: relative;
  }
</style>