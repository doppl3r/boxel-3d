<script setup>
  import { Capacitor } from '@capacitor/core';
  import { App as cApp } from '@capacitor/app';
  import ButtonAction from './ButtonAction.vue';

  function isElectronApp() {
    return window.electron != null;
  }

  function isAndroidApp() {
    return Capacitor.isNativePlatform()
  }

  function exit() {
    if (isElectronApp()) {
      window.electron.quit();
    }
    else if (isAndroidApp()) {
      cApp.exitApp();
    }
  }
</script>

<template>
  <ButtonAction
    class="action"
    title="Exit"
    v-if="isAndroidApp() || isElectronApp()"
    @click="exit"
  >
    <span class="material-symbols-rounded">undo</span>
  </ButtonAction>
</template>

<style lang="scss" scoped>
  .action {
    
  }
</style>