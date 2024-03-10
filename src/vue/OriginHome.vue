<script setup>
  import { ref } from 'vue';
</script>

<template>
  <div class="home dashboard">
    <div class="background"></div>
    <a class="version" tabindex="0"></a>
    <div class="wrapper fade-in">
      <img src="/img/svg/logo-white.svg" class="logo">
      <div class="status-bar">
        <p class="status"><img class="google-icon" src="/img/svg/google-icon.svg" /> <span class="status-text"></span></p>
      </div>
      <div class="buttons">
        <a class="button top-right three hidden" action="fullscreen" title="Enable fullscreen" tabindex="0"><img src="/img/svg/grow.svg"></a>
        <a class="button top-right two" action="account" title="Account" tabindex="0"><img src="/img/svg/cloud-check.svg"></a>
        <a class="button top-right" action="settings" title="Settings" tabindex="0"><img src="/img/svg/gear.svg"></a>
        <a class="button" action="level-manager" tabindex="0"><span>Level Maker</span> <img src="/img/svg/pencil.svg"></a>
        <a class="button" action="shop" tabindex="0"><span>Skins</span> <img src="/img/svg/smile.svg"></a>
        <a class="button" action="level-picker" tabindex="0"><span>Play</span> <img src="/img/svg/play.svg"></a>
      </div>
    </div>
    <a class="review" tabindex="0"><img src="/img/svg/heart.svg">Write a review</a>
  </div>
</template>