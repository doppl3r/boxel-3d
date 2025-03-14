<script setup>
  import '../../v2/src/scss/Global.scss';
  import { onMounted, shallowReactive, reactive, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Banner from './Banner.vue';
  import ButtonDiscord from './ButtonDiscord.vue';
  import ButtonFullScreen from './ButtonFullScreen.vue';
  import ButtonVolume from './ButtonVolume.vue';
  import Card from './Card.vue';
  import ModalNews from './ModalNews.vue';
  import ModalSteam from './ModalSteam.vue';
  import ModalWorkshop from './ModalWorkshop.vue';
  import Loading from '../../v2/src/vue/Loading.vue';
  import { Ticker } from '../../v2/src/js/core/Ticker.js';
  import { Graphics } from '../../v2/src/js/core/Graphics.js';
  import { LightFactory } from '../../v2/src/js/core/factories/LightFactory.js';
  import { AssetLoader } from '../../v2/src/js/core/loaders/AssetLoader.js';

  // Initialize components
  const i18n = useI18n();
  const isElectronApp = ref(window.electron != undefined);
  const settings = reactive(JSON.parse(localStorage.getItem('settings') || '{"volume": 0}'));
  const assets = shallowReactive(new AssetLoader(onLoad));
  const canvas = ref();
  const modalWorkshopVisible = ref(false);
  const modalSteamVisible = ref(false);
  const modalNewsVisible = ref(false);
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

  document.addEventListener('click', function(e) {
    playSound('click');
  });

  // Update <html> language value
  function updateLanguageAttribute() {
    document.documentElement.lang = i18n.locale.value;
  }

  function isExtension() {
    return window.chrome?.extension;
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
    updateLanguageAttribute();
  });
</script>

<template>
  <canvas ref="canvas"></canvas>
  <div class="ui">
    <div class="actions">
      <ButtonVolume :assets="assets" :volume="settings.volume" @click="toggleVolume();"/>
      <ButtonFullScreen />
      <ButtonDiscord @click="openLink('https://discord.gg/j8fvd4UvbE', '_blank')" />
    </div>
    <Banner>{{ i18n.t('home.title') }}</Banner>
    <div class="cards">
      <Card :src="'./svg/button-steam.svg'" @click="modalWorkshopVisible = true;">{{ i18n.t('home.button.workshop') }}</Card>
      <Card :src="'./svg/button-news.svg'" @click="modalNewsVisible = true">{{ i18n.t('home.button.news') }}</Card>
      <Card :src="'./svg/button-play.svg'" @click="openLink('./v1/index.html')">{{ i18n.t('home.button.play') }}</Card>
    </div>
    <ModalWorkshop @close="modalWorkshopVisible = false" v-show="modalWorkshopVisible == true" />
    <ModalSteam @close="modalSteamVisible = false" v-show="modalSteamVisible == true" />
    <ModalNews @close="modalNewsVisible = false" v-show="modalNewsVisible == true" />
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
      right: 1.5em;
      position: absolute;
      top: 1.5em;
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