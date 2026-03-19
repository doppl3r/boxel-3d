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
    if (util.isDesktopApp()) {
      // Send fullscreen toggle through the desktop bridge
      window.desktop.toggleFullScreen();
    }
    else {
      if (util.isFullscreen()) document.exitFullscreen();
      else document.body.requestFullscreen();
    }
  }
</script>

<template>
  <a class="button top-right four" @click="toggleFullscreen" title="Fullscreen (F11)" v-if="util.isNativeApp() == false">
    <img :src="'../svg/grow.svg'" v-if="fullscreen == false">
    <img :src="'../svg/shrink.svg'" v-else>
  </a>
</template>