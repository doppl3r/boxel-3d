<script setup>
  import '@/v2/src/scss/Global.scss';
  import { onMounted, shallowReactive, reactive, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Banner from './Banner.vue';
  import ButtonVolume from './ButtonVolume.vue';
  import Card from './Card.vue';
  import Modal from '@/v2/src/vue/Modal.vue';
  import Loading from '@/v2/src/vue/Loading.vue';
  import { Ticker } from '@/v2/src/js/core/Ticker.js';
  import { Graphics } from '@/v2/src/js/core/Graphics.js';
  import { LightFactory } from '@/v2/src/js/core/factories/LightFactory.js';
  import { AssetLoader } from '@/v2/src/js/core/loaders/AssetLoader.js';

  // Initialize components
  const i18n = useI18n();
  const settings = reactive(JSON.parse(localStorage.getItem('settings') || '{"volume": 0}'));
  const assets = shallowReactive(new AssetLoader(onLoad));
  const canvas = ref();
  let ticker;
  let graphics;
  let background;
  let light;

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

    // Play background music
    updateVolume();
  }

  function playSound(name) {
    var sound = assets.get(name);
    sound.play();
  }

  function render(data) {
    background.mixer.update(data.delta)
    graphics.render();
  }

  function toggleVolume() {
    if (settings.volume > 0) settings.volume = 1;
    settings.volume ^= 1; // Toggle volume between 0 and 1 (bitwise hack)
    updateVolume()
  }

  function updateVolume() {
    localStorage.setItem('settings', JSON.stringify(settings));
    const listener = assets.assetAudioLoader.listener;
    const currentTime = listener.context.currentTime;
    const gain = listener.gain.gain;
    gain.setTargetAtTime(settings.volume, currentTime, 0);
  }

  function openLink(url, target = '_self') {
    window.open(url, target);
  }

  function isExtension() {
    return window.chrome?.extension;
  }

  function openModal() {
    let button;
    let callback;
    let text;

    // Set the news based on the user agent
    if (isExtension()) {
      button = 'View Steam Page';
      text = `Boxel 3D is coming soon to Steam for <strong>$5.99</strong> (USD)\n
        Boxel 3D will always be <strong>free</strong> on Chrome, Edge and Firefox 😄\n
        You can support me by adding it to your <strong>wishlist</strong> or by purchasing a copy on Steam.\n
        Thank you for all the support and I hope you enjoy the game!`;
      callback = function() {
        openLink('https://store.steampowered.com/app/3208440/Boxel_3D/', '_blank');
        window.dispatchEvent(new CustomEvent('closeModal'));
      }
    }
    else {
      button = 'Continue';
      text = `Thank you for supporting the launch of Boxel 3D on Steam!\n
      Good luck beating the community levels lol`;
    };

    // Dispatch new modal from event
    window.dispatchEvent(new CustomEvent('openModal', {
      detail: {
        title: 'News & Events',
        text: text,
        inputs: [
          {
            type: 'button',
            value: button,
            callback: callback
          }
        ]
      }
    }));
  }

  document.addEventListener('click', function(e) {
    playSound('click');
  });

  // Redirect app after loading
  onMounted(function() {
    ticker = new Ticker();
    graphics = new Graphics(canvas.value);
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
      <ButtonVolume :assets="assets" :volume="settings.volume" @click="toggleVolume();"/>
    </div>
    <Banner>{{ i18n.t('home.title') }}</Banner>
    <div class="cards">
      <Card :src="'./svg/button-play-steam.svg'" @click="openModal();">{{ i18n.t('home.button.news') }}</Card>
      <Card :src="'./svg/button-play.svg'" @click="openLink('./v1/index.html')">{{ i18n.t('home.button.play') }}</Card>
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