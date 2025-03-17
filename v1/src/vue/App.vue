<script setup>
  import '../scss/App.scss';
  import { onMounted, ref, watch  } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { App } from '../js/App.js';
  import { mods } from '../js/Data.js';
  import UI from './UI.vue';

  // Initialize app and expose to window scope
  const i18n = useI18n({ useScope: 'global' });
  var canvas = ref();
  var app = window.app = new App();

  // Update <html> language value
  function updateLanguageAttribute() {
    document.documentElement.lang = i18n.locale.value;
  }

  function loadMods() {
    // Check if electron app exists
    if (window.electron) {
      // Loop through each mod item
      mods.forEach(mod => {
        window.electron.loadScript(mod.path);
      });
    }
  }
  
  // Watch the i18n locale changes
  watch(i18n.locale, () => {
    updateLanguageAttribute();
  });

  // Initialize app after canvas has been mounted
  onMounted(function() {
    app.init(canvas.value, loadMods);
    updateLanguageAttribute();
  });
</script>

<template>
  <canvas ref="canvas"></canvas>
  <UI />
</template>