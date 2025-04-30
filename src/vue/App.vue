<script setup>
  import '../../v2/src/scss/Global.scss';
  import { onMounted, onUnmounted, shallowReactive, reactive, ref, watch } from 'vue';
  import { StorageManager } from '../../v1/src/js/StorageManager.js';
  import { Utility } from '../../v1/src/js/Utility.js';
  import { useI18n } from 'vue-i18n';
  import Banner from './Banner.vue';
  import ButtonAndroid from './ButtonAndroid.vue';
  import ButtonDiscord from './ButtonDiscord.vue';
  import ButtonExit from './ButtonExit.vue';
  import ButtonFullScreen from './ButtonFullScreen.vue';
  import ButtonVolume from './ButtonVolume.vue';
  import ButtonReview from './ButtonReview.vue';
  import Card from './Card.vue';
  import ModalWorkshop from './ModalWorkshop.vue';
  import Loading from '../../v2/src/vue/Loading.vue';
  import { Ticker } from '../../v2/src/js/core/Ticker.js';
  import { Graphics } from '../../v2/src/js/core/Graphics.js';
  import { LightFactory } from '../../v2/src/js/core/factories/LightFactory.js';
  import { AssetLoader } from '../../v2/src/js/core/loaders/AssetLoader.js';

  // Initialize components
  const i18n = useI18n();
  const util = new Utility();
  const storage = new StorageManager();
  const settings = reactive(storage.getSettings());
  const assets = shallowReactive(new AssetLoader(onLoad));
  const canvas = ref();
  const modalWorkshopVisible = ref(false);
  const isExiting = ref(false);
  const playLink = ref('./v1/index.html' + document.location.search);
  let volumePrev = settings.volume;
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
    ticker.add(render, 1000 / 60);
    ticker.start();

    // Play background music
    updateVolume();

    // Check URL
    checkParameters();
  }

  function playSound(name) {
    var sound = assets.get(name);
    sound.play();
  }

  function render(data) {
    if (modalWorkshopVisible.value == false) {
      background.mixer.update(data.delta)
      graphics.render();
    }
  }

  function toggleVolume() {
    // Toggle volume state
    if (settings.volume > 0) {
      volumePrev = settings.volume;
      settings.volume = 0;
    }
    else {
      settings.volume = volumePrev || 0.5;
    }

    // Update audio listener
    updateVolume()
  }

  function updateVolume() {
    storage.setSettings(settings);
    const listener = assets.assetAudioLoader.listener;
    const currentTime = listener.context.currentTime;
    const gain = listener.gain.gain;
    gain.setTargetAtTime(settings.volume, currentTime, 0);
  }

  function openLink(url, target = '_self', delay = 0) {
    if (target == '_self') {
      isExiting.value = true;
      delay = 250;
    }

    // Open link with a delay (for fade animation)
    setTimeout(() => {
      window.open(url, target);
    }, delay);
  }

  // Update <html> language value
  function updateLanguageAttribute() {
    document.documentElement.lang = i18n.locale.value;
  }

  function checkParameters() {
    if (location.href.includes('workshop=true')) {
      graphics.render();
      modalWorkshopVisible.value = true;
    }
  }

  function addEventListeners() {
    document.addEventListener('keydown', keydown);
    document.addEventListener('click', function(e) {
      playSound('click');
    });
  }

  function removeEventListeners() {
    document.removeEventListener('keydown', keydown);
  }

  function keydown(e) {
    if (util.isElectronApp()) {
      if (e.code === 'KeyI' && ((e.ctrlKey && e.shiftKey) || (e.metaKey && e.shiftKey))) {
        window.electron.openDevTools();
      }
      else if (e.code === 'Escape') {
        if (modalWorkshopVisible.value == true) modalWorkshopVisible.value = false;
        else window.electron.toggleFullScreen();
      }
      else if (e.code === 'F11') {
        window.electron.toggleFullScreen();
      }
      else if (e.code === 'KeyQ' && e.metaKey) {
        window.electron.quit();
      }
    }
  }

  // Watch the i18n locale changes
  watch(i18n.locale, () => {
    updateLanguageAttribute();
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
    addEventListeners();
    updateLanguageAttribute();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <canvas ref="canvas"></canvas>
  <div class="ui">
    <div class="nav">
      <ButtonExit class="left" />
      <ButtonVolume :assets="assets" :volume="settings.volume" @click="toggleVolume();"/>
      <ButtonAndroid @click="openLink('https://play.google.com/store/apps/details?id=com.boxel3d.app', '_blank')" />
      <ButtonFullScreen />
      <ButtonDiscord @click="openLink('https://discord.gg/j8fvd4UvbE', '_blank')" />
    </div>
    <Banner>{{ i18n.t('home.title') }}</Banner>
    <div class="cards">
      <Card :src="'./svg/button-steam.svg'" @click="modalWorkshopVisible = true;">{{ i18n.t('home.button.workshop') }}</Card>
      <Card :src="'./svg/button-play.svg'" @click="openLink(playLink)">{{ i18n.t('home.button.play') }}</Card>
    </div>
    <div class="footer">
      <ButtonReview />
    </div>
    <ModalWorkshop @close="modalWorkshopVisible = false" v-show="modalWorkshopVisible == true" />
    <Loading />

    <div class="fade-exit" :class="{ 'is-exiting': isExiting }"></div>
  </div>
</template>

<style lang="scss" scoped>
  .fade-exit {
    background-color: #000000;
    height: 100%;
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    transition: opacity 0.25s ease;
    width: 100%;

    &.is-exiting {
      opacity: 1;
    }
  }

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

    .nav {
      display: flex;
      gap: 0.5em;
      justify-content: flex-end;
      left: 1.5em;
      right: 1.5em;
      position: absolute;
      top: 1.5em;
    }

    .footer {
      display: flex;
      gap: 0.5em;
      right: 1.5em;
      position: absolute;
      bottom: 1.5em;
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