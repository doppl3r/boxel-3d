<script setup>
  import '../scss/App.scss';
  import { onMounted, onUnmounted, ref, watch  } from 'vue';
  import { Utility } from '../js/Utility.js';
  import { App as cApp } from '@capacitor/app';
  import { App } from '../js/App.js';
  import { useI18n } from 'vue-i18n';
  import UI from './UI.vue';

  // Initialize app and expose to window scope
  const util = new Utility();
  const i18n = useI18n({ useScope: 'global' });
  var canvas = ref();
  var app = window.app = new App();

  // Mute Android audio when state is inactive
  cApp.addListener('appStateChange', ({ isActive }) => {
    const settings = app.storage.getSettings(app);
    app.assets.audio.setMasterVolume(isActive ? settings.volume : 0, 'master');
    app.assets.audio.setMasterVolume(isActive ? settings.volumeEffects : 0, 'effects');
    app.assets.audio.setMasterVolume(isActive ? settings.volumeMusic : 0, 'music');
  });

  // Update <html> language value
  function updateLanguageAttribute() {
    document.documentElement.lang = i18n.locale.value;
  }

  function loadMods() {
  }

  function addEventListeners() {
    document.addEventListener('keydown', keydown);
  }

  function removeEventListeners() {
    document.removeEventListener('keydown', keydown);
  }

  function keydown(e) {
    if (util.isDesktopApp()) {
      if (e.code === 'KeyI' && ((e.ctrlKey && e.shiftKey) || (e.metaKey && e.shiftKey))) {
        window.desktop.openDevTools();
      }
      else if (e.code === 'F11') {
        window.desktop.toggleFullScreen();
      }
      else if (e.code === 'KeyQ' && e.metaKey) {
        window.desktop.quit();
      }
    }
  }
  
  // Watch the i18n locale changes
  watch(i18n.locale, () => {
    updateLanguageAttribute();
  });

  // Initialize app after canvas has been mounted
  onMounted(function() {
    app.init(canvas.value, loadMods);
    addEventListeners();
    updateLanguageAttribute();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <canvas ref="canvas"></canvas>
  <UI />
</template>