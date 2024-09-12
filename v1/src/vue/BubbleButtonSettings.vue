<script setup>
  import { ref } from 'vue';

  function openSettings() {
    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openSettings'));
  }
</script>

<template>
  <a @click="openSettings" title="Settings">
    <span class="material-symbols-rounded">settings</span>
  </a>
</template>