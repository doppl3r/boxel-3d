<script setup>
  import { Utility } from '../../v1/src/js/Utility.js';
  import ButtonAction from './ButtonAction.vue';

  // Initialize utility library
  const util = new Utility();
</script>

<template>
  <ButtonAction
    class="action notification"
    title="Download Android app"
    v-if="util.isNativeApp() == false"
  >
    <span class="material-symbols-rounded">android</span>
  </ButtonAction>
</template>

<style lang="scss" scoped>
  .action {
    
  }
</style>