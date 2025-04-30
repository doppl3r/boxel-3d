<script setup>
  import { Utility } from '../../v1/src/js/Utility.js';
  import Modal from './Modal.vue';

  // Initialize attributes
  const util = new Utility();
</script>

<template>
  <Modal class="steam">
    <template #title>
      Steam Workshop
    </template>
    
    <template #text>
      <p>The <strong>Steam Workshop</strong> is coming soon to Boxel 3D!</p>
      <p>Purchase Boxel 3D to unlock <strong>unlimited</strong> community levels!</p>
    </template>

    <template #buttons>
      <button @click="util.openLink('https://store.steampowered.com/app/3208440/Boxel_3D/', '_blank')">View Steam Page</button>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
  
</style>