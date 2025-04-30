<script setup>
  import { Capacitor } from '@capacitor/core';
  import ButtonAction from './ButtonAction.vue';

  function isElectronApp() {
    return window.electron != null;
  }

  function isAndroidApp() {
    return Capacitor.isNativePlatform()
  }
</script>

<template>
  <ButtonAction
    class="action notification"
    title="Download Android app"
    v-if="isAndroidApp() == false && isElectronApp() == false"
  >
    <span class="material-symbols-rounded">phone_android</span>
  </ButtonAction>
</template>

<style lang="scss" scoped>
  .action {
    
  }
</style>