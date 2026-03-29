<script setup>
  import { Utility } from '../../v1/src/js/Utility.js';
  import Modal from './Modal.vue';

  // Initialize attributes
  const util = new Utility();
</script>

<template>
  <Modal>
    <template #title>
      <span class="material-symbols-rounded">android</span>
    </template>
    
    <template #text>
      <p>Boxel 3D is now available on <strong>Android</strong> devices!</p>
    </template>

    <template #buttons>
      <button class="button" @click="util.openLink('https://play.google.com/store/apps/details?id=com.boxel3d.app', '_blank')">
        <span>Google Play</span> <span class="material-symbols-rounded">shop</span>
      </button>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
  @keyframes throb { 0% { transform: scale(1); } 25% { transform: scale(1.20); } 50% { transform: scale(1); }}

  .button {
    align-items: center;
    animation: throb 3s ease-in-out infinite;
    display: inline-flex;
    gap: 0.5em;
  }

  .icon {
    animation: throb 3s ease-in-out infinite;
    display: inline-block;
  }
</style>