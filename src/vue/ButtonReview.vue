<script setup>
  import { Utility } from '../../v1/src/js/Utility.js';
  import ButtonAction from './ButtonAction.vue';

  // Initialize utility library
  const util = new Utility();

  async function openReviewLink() {
    var url = '';

    if (util.isNativeApp()) {
      url = 'https://play.google.com/store/apps/details?id=com.boxel3d.app';
    }
    else {
      // Other userAgents: https://stackoverflow.com/a/26358856/2510368
      if (navigator.userAgent.indexOf("Edg") != -1) { url = 'https://microsoftedge.microsoft.com/addons/detail/boxel-3d/gcklngphfijejfnnicbadhghhdifidek'; }
      else if (navigator.userAgent.indexOf("Chrome") != -1) { url = 'https://chromewebstore.google.com/detail/boxel-3d/mjjgmlmpeaikcaajghilhnioimmaibon/reviews'; }
      else if (navigator.userAgent.indexOf("Firefox") != -1) { url = 'https://addons.mozilla.org/en-US/firefox/addon/boxel-3d-game/'; }
    }

    // Open the link
    util.openLink(url);
  }
</script>

<template>
  <ButtonAction
    v-if="util.isExtension() || util.isNativeApp()"
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