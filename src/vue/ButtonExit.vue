<script setup>
  import { Utility } from '../../v1/src/js/Utility.js';
  import { App as cApp } from '@capacitor/app';
  import ButtonAction from './ButtonAction.vue';

  // Initialize utility library
  const util = new Utility();

  function exit() {
    if (util.isDesktopApp()) {
      window.desktop.quit();
    }
    else if (util.isNativeApp()) {
      cApp.exitApp();
    }
  }
</script>

<template>
  <ButtonAction
    class="action"
    title="Exit"
    v-if="util.isDesktopApp() || util.isNativeApp()"
    @click="exit"
  >
    <span class="material-symbols-rounded">undo</span>
  </ButtonAction>
</template>

<style lang="scss" scoped>
  .action {
    
  }
</style>