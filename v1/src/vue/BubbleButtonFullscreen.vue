<script setup>
  import { Utility } from '../js/Utility.js';
  import { ref } from 'vue';

  // Initialize utility library
  const util = new Utility();
  const fullscreen = ref(false);

  document.addEventListener('fullscreenchange', function() {
    fullscreen.value = util.isFullscreen();
  });

  function toggleFullscreen() {
    // Open link in new tab if player is using extension
    if (util.isExtension()) {
      if (window.location.href.includes('?tab=true') == false) {
        util.openLink(window.location.href + '?tab=true');
        return;
      }
    }

    // Toggle fullscreen
    if (util.isElectronApp()) {
      // Send fullscreen toggle through the desktop bridge
      window.electron.toggleFullScreen();
    }
    else {
      if (util.isFullscreen()) document.exitFullscreen();
      else document.body.requestFullscreen();
    }
  }
</script>

<template>
  <a @click="toggleFullscreen" title="Fullscreen (F11)" v-if="util.isNativeApp() == false">
    <span class="material-symbols-rounded" v-if="fullscreen == true">fullscreen_exit</span>
    <span class="material-symbols-rounded" v-else>fullscreen</span>
  </a>
</template>