<script setup>
  import Modal from './Modal.vue';

  function openLink(url, target = '_self') {
    window.open(url, target);
  }
</script>

<template>
  <Modal>
    <template #title>
      Steam Edition
    </template>
    
    <template #text>
      <p>Support me by adding Boxel 3D to your Steam <strong>wishlist</strong> or by purchasing a copy today!</p>
    </template>

    <template #buttons>
      <button @click="openLink('https://store.steampowered.com/app/3208440/Boxel_3D/', '_blank')">View Steam Page</button>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
  
</style>