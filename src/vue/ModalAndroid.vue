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
      <p>Boxel 3D is now available on <strong>Google Play!</strong></p>
    </template>

    <template #buttons>
      <button @click="util.openLink('https://play.google.com/store/apps/details?id=com.boxel3d.app', '_blank')">
        <span class="discount">$2.99</span> <span class="price">$0.99</span>
      </button>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
  @keyframes throb { 0% { transform: scale(1); } 25% { transform: scale(1.20); } 50% { transform: scale(1); }}

  .discount {
    display: inline-block;
    opacity: 0.25;
    position: relative;

    &:after {
      border-bottom: 0.125em solid #000;
      content: '';
      display: block;
      top: 50%;
      transform: translateY(-50%) rotate(-30deg);
      left: 0;
      position: absolute;
      width: 100%;
    }
  }

  .price {
    animation: throb 3s ease-in-out infinite;
    display: inline-block;
  }
</style>