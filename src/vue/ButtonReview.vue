<script setup>
  import { Capacitor } from '@capacitor/core';
  import ButtonAction from './ButtonAction.vue';

  async function openReviewLink() {
    var url = '';

    if (isAndroidApp()) {
      url = 'https://play.google.com/store/apps/details?id=com.boxel3d.app'
    }
    else {
      // Other userAgents: https://stackoverflow.com/a/26358856/2510368
      if (navigator.userAgent.indexOf("Edg") != -1) { url = 'https://microsoftedge.microsoft.com/addons/detail/boxel-3d/gcklngphfijejfnnicbadhghhdifidek'; }
      else if (navigator.userAgent.indexOf("Chrome") != -1) { url = 'https://chromewebstore.google.com/detail/boxel-3d/mjjgmlmpeaikcaajghilhnioimmaibon/reviews'; }
      else if (navigator.userAgent.indexOf("Firefox") != -1) { url = 'https://addons.mozilla.org/en-US/firefox/addon/boxel-3d-game/'; }
    }

    // Open the link
    openLink(url);
  }
  
  function openLink(url, target = '_blank') {
    if (window.chrome?.tabs) window.chrome.tabs.create({ url: url });
    else window.open(url, target);
  }

  function isExtension() {
    return window.chrome?.extension;
  }

  function isAndroidApp() {
    return Capacitor.isNativePlatform()
  }
</script>

<template>
  <ButtonAction
    v-if="isExtension() || isAndroidApp()"
    class="action"
    @click="openReviewLink()"
  >
    <span class="material-symbols-rounded">favorite</span>
    <span>Write a Review</span>
  </ButtonAction>
</template>

<style lang="scss" scoped>
  .action {
    width: auto;

    &:focus,
    &:hover {
      transform: initial;
    }
    
    .material-symbols-rounded {
      animation: throb 1s ease-in-out infinite;
      color: #EB2B6D;
    }
  }

  @keyframes throb { 0% { transform: scale(1); } 10% { transform: scale(1.20); } 20% { transform: scale(1); } 30% { transform: scale(1.20); } 40% { transform: scale(1); }}
</style>