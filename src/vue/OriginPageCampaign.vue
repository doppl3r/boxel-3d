<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';
  import OriginStats from './OriginStats.vue';

  // Initialize variables
  var credit = ref('');
  var isClosed = ref(true); // Popup animation state

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('setCredit', setCredit);
    window.addEventListener('popupOpened', popupOpened);
    window.addEventListener('popupClosed', popupClosed);
    window.addEventListener('keydown', keydown);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('setCredit', setCredit);
    window.removeEventListener('popupOpened', popupOpened);
    window.removeEventListener('popupClosed', popupClosed);
    window.removeEventListener('keydown', keydown);
  }

  function setCredit(e) {
    if (e.detail.text) credit.value = e.detail.text;
  }

  function pauseLevel() {
    app.pauseLevel();
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: 'Paused',
        inputs: [
          { value: 'Exit (E)', type: 'button', callback: function(e) { app.exitCampaign(); }},
          { value: 'Retry (R)', type: 'button', callback: function(e) { app.level.retryLevel(); }},
          { value: 'Play', type: 'button', callback: function(e) { setTimeout(function() { app.resumeLevel(); }, 100); }}
        ]
      }
    }));
  }

  function popupOpened() {
    isClosed.value = false;
  }
  
  function popupClosed() {
    isClosed.value = true;
  }

  function keydown(e) {
    // Make sure popup is closed
    if (isClosed.value == true) {
      if (e.code == 'Escape') {
        e.preventDefault();
        pauseLevel();
      }
      else if (e.code == 'KeyE') {
        app.exitCampaign();
      }
      else if (e.code == 'KeyR') {
        app.level.retryLevel();
      }
      else {
        var jumpKeys = ['Space', 'Enter', 'ArrowUp', 'KeyW'];
        if (jumpKeys.indexOf(e.code) > -1) {
          // Jump if one of the keys is pressed
          app.player.jump();
        }
      }
    }
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    app.showCanvas();
    addEventListeners();
  });

  onUnmounted(function() {
    app.hideCanvas();
    removeEventListeners();
  });
</script>

<template>
  <div class="campaign dashboard">
    <div id="timer"></div>
    <div id="credit" class="fade-in" v-html="credit" v-if="credit"></div>
    <div id="speedometer"><span id="speed"></span></div>
    <div class="buttons">
      <a class="button top-left" @click="pauseLevel" title="Pause (ESC)"><img src="/img/svg/pause.svg"></a>
      <OriginButtonSettings class="button top-right" />
    </div>
    <OriginStats />
  </div>
</template>