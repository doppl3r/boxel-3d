<script setup>
  import { Utility } from '../../v1/src/js/Utility.js';
  import ButtonAction from './ButtonAction.vue';

  // Initialize utility library
  const util = new Utility();

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
      // Send message to preload.mjs
      window.electron.toggleFullScreen();
    }
    else {
      if (util.isFullscreen()) document.exitFullscreen();
      else document.body.requestFullscreen();
    }
  }
</script>

<template>
  <ButtonAction
    class="action"
    title="Fullscreen"
    @click="toggleFullscreen"
    v-if="util.isNativeApp() == false"
  >
    <span class="material-symbols-rounded">fullscreen</span>
  </ButtonAction>
</template>

<style lang="scss" scoped>
  .action {
    
  }
</style>