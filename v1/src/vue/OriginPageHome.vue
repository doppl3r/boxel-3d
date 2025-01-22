<script setup>
  import { ref, onMounted } from 'vue';
  import OriginButtonFullscreen from './OriginButtonFullscreen.vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';

  // Initialize attributes
  var manifest = ref();
  var version = ref();
  var message = ref('You are currently using the old UI');

  async function updateVersion() {
    var response = await fetch('../manifest.json');
    var json = await response.json();
    manifest.value = json;
    version.value = json.version;
  }

  function openLink(url) {
    if (chrome.tabs) chrome.tabs.create({ url: url });
    else window.open(url, '_blank');
  }

  function goBack() {
    window.location.href = '../index.html';
  }

  function isFullscreen() {
    return location.href.indexOf('?fullscreen=true') > 0;
  }

  function openFullscreen() {
    openLink(location.href + '?fullscreen=true');
  }

  function openReviewLink() {
    var url = '';

    // Other userAgents: https://stackoverflow.com/a/26358856/2510368
    if (navigator.userAgent.indexOf("Edg") != -1) { url = 'https://microsoftedge.microsoft.com/addons/detail/boxel-3d/gcklngphfijejfnnicbadhghhdifidek'; }
    else if (navigator.userAgent.indexOf("Chrome") != -1) { url = 'https://chromewebstore.google.com/detail/boxel-3d/mjjgmlmpeaikcaajghilhnioimmaibon/reviews'; }
    else if (navigator.userAgent.indexOf("Firefox") != -1) { url = 'https://addons.mozilla.org/en-US/firefox/addon/boxel-3d-game/'; }

    // Open the link
    openLink(url);
  }

  function showAccountOptions() {
    var inputs = [
      { value: 'Backup to file', type: 'button', style: 'width: 100%', callback: app.storage.backupToFile },
      { value: 'Restore from file', type: 'button', style: 'width: 100%', callback: app.storage.restoreFromFile },
      { value: 'Close', type: 'button' }
    ]

    // Add Chrome sync options
    if (chrome.storage) {
      inputs.unshift(
        { value: 'Backup to Google', type: 'button', style: 'width: 100%', callback: app.storage.backupToChrome },
        { value: 'Restore from Google', type: 'button', style: 'width: 100%', callback: app.storage.restoreFromChrome }
      )
    }

    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: '<img src="../svg/cloud-check.svg">',
        inputs: inputs
      }
    }));
  }

  async function showChangelog() {
    const changelog = await fetch('../json/changelog.json').then(function (response) {
      if (response.ok) { return response.json(); }
      throw new Error('Something went wrong');
    })
    .then(function(json) { return json; }.bind(this))
    .catch(function(error) { console.error(error); });
    var text = '';

    // Update text from changelog json file
    for (var i = changelog.length - 1; i >= 0; i--) {
      var log = changelog[i];
      text += 'v' + log.version + '\n';

      // Loop through version revisions
      log.revisions.forEach(function(revision) { text += '- ' + revision + '\n'; });
      text += '\n';
    }

    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: '<div style="text-align: left;">' + text + '</div>',
        inputs: [{ type: 'button', value: 'Close' }]
      }
    }));
  }

  function focus(selector) {
    var el = document.querySelector(selector);
    el.focus();
  }

  function isExtension() {
    return window.chrome?.extension;
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    updateVersion();
    focus('.focus');
  });
</script>

<template>
  <div class="home dashboard">
    <div class="background-cubes"></div>
    <a class="version fade-in" @click="showChangelog">v{{ version }}</a>
    <div class="wrapper fade-in">
      <img :src="'../svg/logo-white.svg'" class="logo">
      <div class="message-bar">
        <div class="message"><img class="google-icon" :src="'../svg/light.svg'" /> <span class="message-text" v-html="message"></span></div>
      </div>
      <div class="buttons">
        <OriginButtonFullscreen class="button top-right" />
        <a class="button top-right three"  @click="goBack" title="Go back"><img :src="'../svg/back.svg'"></a>
        <a class="button top-right two" @click="showAccountOptions" title="Account"><img :src="'../svg/cloud-check.svg'"></a>
        <OriginButtonSettings class="button top-right" />
        <a class="button" @click="$emit('setPage', 'level-manager')" tabindex="0"><span>Level Maker</span> <img :src="'../svg/pencil.svg'"></a>
        <a class="button" @click="$emit('setPage', 'skins')" tabindex="0"><span>Skins</span> <img :src="'../svg/smile.svg'"></a>
        <a class="button focus" @click="$emit('setPage', 'level-picker')" tabindex="0"><span>Play</span> <img :src="'../svg/play.svg'"></a>
      </div>
    </div>
    <a class="review fade-in" @click="openReviewLink" v-if="isExtension()"><img :src="'../svg/heart.svg'">Write a review</a>
  </div>
</template>