<script setup>
  import ButtonAction from './ButtonAction.vue';

  function isElectronApp() {
    return window.electron != null;
  }

  function toggleFullScreen() {
    // Send message to preload.mjs
    window.electron.toggleFullScreen();
  }
</script>

<template>
  <ButtonAction
    class="action"
    title="Fullscreen"
    @click="toggleFullScreen"
    v-if="isElectronApp()"
  >
    <span class="material-symbols-rounded">fullscreen</span>
  </ButtonAction>
</template>

<style lang="scss" scoped>
  .action {
    
  }
</style>