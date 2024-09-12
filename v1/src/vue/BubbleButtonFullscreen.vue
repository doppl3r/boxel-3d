<script setup>
  function isFullscreen() {
    return location.href.includes('?fullscreen=true');
  }

  function openLink(url) {
    if (chrome.tabs) chrome.tabs.create({ url: url });
    else window.open(url, '_blank');
  }

  function openFullscreen() {
    openLink(location.href + '?fullscreen=true');
  }
</script>

<template>
  <a @click="openFullscreen" title="Fullscreen" v-if="isFullscreen() == false">
    <span class="material-symbols-rounded">fullscreen</span>
  </a>
</template>