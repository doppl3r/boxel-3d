<script setup>
  function openSettings() {
    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openSettings'));
  }
</script>

<template>
  <a @click="openSettings">
    <span class="material-symbols-rounded">settings</span>
  </a>
</template>