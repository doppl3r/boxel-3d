<script setup>
  import ButtonAction from './ButtonAction.vue';

  function openReviewLink() {
    var url = '';

    // Other userAgents: https://stackoverflow.com/a/26358856/2510368
    if (navigator.userAgent.indexOf("Edg") != -1) { url = 'https://microsoftedge.microsoft.com/addons/detail/boxel-3d/gcklngphfijejfnnicbadhghhdifidek'; }
    else if (navigator.userAgent.indexOf("Chrome") != -1) { url = 'https://chromewebstore.google.com/detail/boxel-3d/mjjgmlmpeaikcaajghilhnioimmaibon/reviews'; }
    else if (navigator.userAgent.indexOf("Firefox") != -1) { url = 'https://addons.mozilla.org/en-US/firefox/addon/boxel-3d-game/'; }

    // Open the link
    openLink(url);
  }

  function openLink(url, target = '_blank') {
    if (chrome.tabs) chrome.tabs.create({ url: url });
    else window.open(url, target);
  }
</script>

<template>
  <ButtonAction class="action" @click="openReviewLink()">
    <span class="material-symbols-rounded">favorite</span>
    <span>Write a Review</span>
  </ButtonAction>
</template>

<style lang="scss" scoped>
  .action {
    animation: shake 4s ease-in-out infinite;
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

  @keyframes shake { 0% { transform: rotate(0); } 10% { transform: rotate(-10deg); } 20% { transform: rotate(10deg); } 30% { transform: rotate(0deg); } }
  @keyframes throb { 0% { transform: scale(1); } 10% { transform: scale(1.20); } 20% { transform: scale(1); } 30% { transform: scale(1.20); } 40% { transform: scale(1); }}
</style>