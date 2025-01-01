<script setup>
  import { ref } from 'vue';

  const fullscreen = ref(false);

  document.addEventListener('fullscreenchange', function() {
    fullscreen.value = isFullscreen();
  })

  function isExtension() {
    return chrome.extension;
  }

  function isFullscreen() {
    return document.fullscreenElement != null;
  }

  function openLink(url) {
    if (chrome.tabs) chrome.tabs.create({ url: url });
    else window.open(url, '_blank');
  }

  function toggleFullscreen() {
    // Open link in new tab if player is using extension
    if (isExtension()) {
      if (window.location.href.includes('?tab=true') == false) {
        openLink(window.location.href + '?tab=true');
        return;
      }
    }

    // Toggle fullscreen
    if (isFullscreen()) document.exitFullscreen();
    else document.body.requestFullscreen();
  }
</script>

<template>
  <a class="button top-right four" @click="toggleFullscreen" title="Fullscreen (F11)">
    <img :src="'../svg/grow.svg'" v-if="fullscreen == false">
    <img :src="'../svg/shrink.svg'" v-else>
  </a>
</template>