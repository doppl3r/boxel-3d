<script setup>
  import { Utility } from '../../v1/src/js/Utility.js';
  import Modal from './Modal.vue';

  // Initialize attributes
  const util = new Utility();
</script>

<template>
  <Modal class="steam">
    <template #title>
      <span class="material-symbols-rounded">android</span>
    </template>
    
    <template #text>
      <p>Want to support Boxel 3D?</p>
      <p>Purchase Boxel 3D on <strong>Google Play</strong> to unlock all features wherever you go!</p>
    </template>

    <template #buttons>
      <button @click="util.openLink('https://play.google.com/store/apps/details?id=com.boxel3d.app', '_blank')">Google Play</button>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
  
</style>