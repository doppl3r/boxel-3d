<script setup>
  import { ref } from 'vue';
  import changelog from '../json/changelog.json';

  // Initialize attributes
  var version = ref(getVersion());
  changelog.reverse();

  function getVersion() {
    return changelog[changelog.length - 1].version;
  }

  function showChangelog() {
    var text = '';

    // Update text from changelog json file
    changelog.forEach(function(log) {
      text += 'v' + log.version + '\n';

      // Loop through version revisions
      log.revisions.forEach(function(revision) { text += '- ' + revision + '\n'; });
      text += '\n';
    });

    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('addPopup', {
      detail: {
        text: '<div style="text-align: left;">' + text + '</div>',
        inputs: [{ type: 'button', value: 'Close' }]
      }
    }));
  }
</script>

<template>
  <div class="home dashboard">
    <div class="background"></div>
    <a class="version" @click="showChangelog">v{{ version }}</a>
    <div class="wrapper fade-in">
      <img src="/img/svg/logo-white.svg" class="logo">
      <div class="status-bar">
        <p class="status"><img class="google-icon" src="/img/svg/google-icon.svg" /> <span class="status-text"></span></p>
      </div>
      <div class="buttons">
        <a class="button top-right three hidden" action="fullscreen" title="Enable fullscreen"><img src="/img/svg/grow.svg"></a>
        <a class="button top-right two" action="account" title="Account"><img src="/img/svg/cloud-check.svg"></a>
        <a class="button top-right" action="settings" title="Settings"><img src="/img/svg/gear.svg"></a>
        <a class="button" action="level-manager"><span>Level Maker</span> <img src="/img/svg/pencil.svg"></a>
        <a class="button" action="shop"><span>Skins</span> <img src="/img/svg/smile.svg"></a>
        <a class="button" action="level-picker"><span>Play</span> <img src="/img/svg/play.svg"></a>
      </div>
    </div>
    <a class="review"><img src="/img/svg/heart.svg">Write a review</a>
  </div>
</template>