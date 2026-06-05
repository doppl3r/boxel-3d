<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';
  import OriginControls from './OriginControls.vue';
  import OriginStats from './OriginStats.vue';

  // Initialize variables
  const credit = ref('');
  const isClosed = ref(true); // Popup animation state
  const isClosing = ref(false);
  const isInputEnabled = ref(true);

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('setCredit', setCredit);
    window.addEventListener('popupOpened', popupOpened);
    window.addEventListener('popupClosed', popupClosed);
    window.addEventListener('popupClosing', popupClosing);
    window.addEventListener('pointerdown', pointerdown);
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('setCredit', setCredit);
    window.removeEventListener('popupOpened', popupOpened);
    window.removeEventListener('popupClosed', popupClosed);
    window.removeEventListener('popupClosing', popupClosing);
    window.removeEventListener('pointerdown', pointerdown);
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('keyup', keyup);
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
          { value: 'Exit (E)', type: 'button', shortcut: 'KeyE', callback: function(e) { app.exitCampaign(); }},
          { value: 'Retry (R)', type: 'button', shortcut: 'KeyR', callback: function(e) { app.level.retryLevel(); }},
          { value: 'Play', type: 'button', shortcut: 'Space', callback: function(e) { app.resumeLevel(); }}
        ]
      }
    }));
  }

  function popupOpened() {
    isClosed.value = false;
    isInputEnabled.value = false;
  }
  
  function popupClosed() {
    isClosed.value = true;
    isClosing.value = false;
  }

  function popupClosing() {
    isClosing.value = true;
    setTimeout(function() {
      isInputEnabled.value = true;
    }, 50);
  }

  function pointerdown(e) {
    // Make sure popup is closed
    if (isClosed.value == true || isClosing.value === true) {
      // Enable input immediately
      isInputEnabled.value = true;
    }
  }

  function keydown(e) {
    // Make sure popup is closed
    if (isClosed.value == true || isClosing.value === true) {
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
      else if (e.code == 'KeyC') {
        app.player.restart();
      }
      else if (e.code == 'KeyA' || e.code == 'ArrowLeft') {
        if (app.play == true) {
          app.player.setControls('left', -1);
        }
      }
      else if (e.code == 'KeyD' || e.code == 'ArrowRight') {
        if (app.play == true) {
          app.player.setControls('right', 1);
        }
      }
      else {
        var jumpKeys = ['Space', 'Enter', 'ArrowUp', 'KeyW'];
        if (isInputEnabled.value === true && jumpKeys.indexOf(e.code) > -1) {
          // Jump if one of the keys is pressed
          app.player.jump();
        }

        // Enable input immediately
        isInputEnabled.value = true;
      }
    }
  }

  function keyup(e) {
    if (e.code == 'KeyA' || e.code == 'ArrowLeft') {
      app.player.setControls('left', 0);
    }
    else if (e.code == 'KeyD' || e.code == 'ArrowRight') {
      app.player.setControls('right', 0);
    }
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    app.showCanvas();
    addEventListeners();

    // Dispatch ready event to listeners
    window.dispatchEvent(new CustomEvent('pageMounted', { detail: 'campaign' }));
  });

  onUnmounted(function() {
    app.hideCanvas();
    removeEventListeners();
  });
</script>

<template>
  <div class="campaign dashboard">
    <Teleport to="body">
      <div class="background-cubes"></div>
    </Teleport>
    <div id="timer"></div>
    <div id="credit" class="fade-in" v-html="credit" v-if="credit"></div>
    <div id="speedometer"><span id="speed"></span></div>
    <div class="buttons">
      <a class="button top-left" @click="pauseLevel" title="Pause (ESC)"><img :src="'./svg/pause.svg'"></a>
      <OriginButtonSettings class="button top-right" />
    </div>
    <OriginStats />
    <OriginControls />
  </div>
</template>