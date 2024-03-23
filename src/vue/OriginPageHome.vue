<script setup>
  import { ref, onMounted } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';
  import changelog from '../json/changelog.json';
  import messages from '../json/messages.json';

  // Initialize attributes
  var manifest = ref();
  var version = ref();
  var message = ref('Tiny Tycoon is now available on Google Chrome!'); // Optional: getRandomMessage()
  var origin = ref(location.origin);
  var pathname = ref(location.pathname.includes('.') ? '/' : location.pathname);

  async function updateVersion() {
    var response = await fetch(origin.value + pathname.value + 'manifest.json');
    var json = await response.json();
    manifest.value = json;
    version.value = json.version;
  }

  function getRandomMessage() {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  function openLink(url) {
    if (chrome.tabs) chrome.tabs.create({ url: url });
    else window.open(url, '_blank');
  }

  function openMessageLink() {
    openLink('https://chrome.google.com/webstore/detail/tiny-tycoon/bamdkjfjhhnjcgcjmmjdnncpglihepoi');
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
    window.dispatchEvent(new CustomEvent('addPopup', {
      detail: {
        text: '<img src="img/svg/cloud-check.svg">',
        inputs: inputs
      }
    }));
  }

  function showChangelog() {
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
    window.dispatchEvent(new CustomEvent('addPopup', {
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

  // Run function after being mounted (visible)
  onMounted(function() {
    updateVersion();
    focus('.focus');
  });
</script>

<template>
  <div class="home dashboard">
    <div class="background"></div>
    <a class="version fade-in" @click="showChangelog">v{{ version }}</a>
    <div class="wrapper fade-in">
      <img src="/img/svg/logo-white.svg" class="logo">
      <div class="message-bar" @click="openMessageLink">
        <div class="message"><img class="google-icon" src="/img/svg/google-icon.svg" /> <span class="message-text" v-html="message"></span></div>
      </div>
      <div class="buttons">
        <a class="button top-right three" @click="openFullscreen" v-if="!isFullscreen()" title="Enable fullscreen"><img src="/img/svg/grow.svg"></a>
        <a class="button top-right two" @click="showAccountOptions" title="Account"><img src="/img/svg/cloud-check.svg"></a>
        <OriginButtonSettings class="button top-right" />
        <a class="button" @click="$emit('setPage', 'level-manager')" tabindex="0"><span>Level Maker</span> <img src="/img/svg/pencil.svg"></a>
        <a class="button" @click="$emit('setPage', 'skins')" tabindex="0"><span>Skins</span> <img src="/img/svg/smile.svg"></a>
        <a class="button focus" @click="$emit('setPage', 'level-picker')" tabindex="0"><span>Play</span> <img src="/img/svg/play.svg"></a>
      </div>
    </div>
    <a class="review fade-in" @click="openReviewLink"><img src="/img/svg/heart.svg">Write a review</a>
  </div>
</template>