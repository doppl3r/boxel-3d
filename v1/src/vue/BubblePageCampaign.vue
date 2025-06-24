<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BubbleButtonCheckpoint from './BubbleButtonCheckpoint.vue';
  import BubbleButtonSettings from './BubbleButtonSettings.vue';
  import BubbleControls from './BubbleControls.vue';
  import BubbleStats from './BubbleStats.vue';

  // Initialize variables
  const i18n = useI18n({ useScope: 'global' });
  const credit = ref('');
  const isClosed = ref(true); // Popup animation state
  const isClosing = ref(false);
  const record = ref();

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('setCredit', setCredit);
    window.addEventListener('popupOpened', popupOpened);
    window.addEventListener('popupClosed', popupClosed);
    window.addEventListener('popupClosing', popupClosing);
    window.addEventListener('beforeSettingsOpened', settingsOpened);
    window.addEventListener('beforeSettingsClosed', settingsClosed);
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('setCredit', setCredit);
    window.removeEventListener('popupOpened', popupOpened);
    window.removeEventListener('popupClosed', popupClosed);
    window.removeEventListener('popupClosing', popupClosing);
    window.removeEventListener('beforeSettingsOpened', settingsOpened);
    window.removeEventListener('beforeSettingsClosed', settingsClosed);
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
        text: i18n.t('popup.text.paused'),
        inputs: [
          { value: i18n.t('popup.button.exit'), type: 'button', shortcut: 'KeyE', callback: function(e) { app.exitCampaign(); }},
          { value: i18n.t('popup.button.retry'), type: 'button', shortcut: 'KeyR', callback: function(e) { app.level.retryLevel(); }},
          { value: i18n.t('popup.button.play'), type: 'button', shortcut: 'Space', callback: function(e) { setTimeout(function() { app.resumeLevel(); }, 100); }}
        ]
      }
    }));
  }

  function popupOpened() {
    isClosed.value = false;
  }
  
  function popupClosed() {
    isClosed.value = true;
    isClosing.value = false;
    getHighScore(); // Refresh record score
  }

  function popupClosing() {
    isClosing.value = true;
  }

  function settingsOpened() {
    app.pauseLevel();
  }
  
  function settingsClosed() {
    app.resumeLevel();
  }

  function keydown(e) {
    // Make sure popup is closed
    if (isClosed.value == true || isClosing.value === true) {
      // Ignore events from inputs
      if (e.target.value == null) {
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
          if (jumpKeys.indexOf(e.code) > -1) {
            // Jump if one of the keys is pressed
            app.player.jump();
          }
        }
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

  function getHighScore() {
    var scores = app.storage.getScores();
    var score = scores[app.level.publishedFileId || app.level.name];

    if (score) {
      record.value = app.timer.toHTML(score);
    }
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    app.showCanvas();
    getHighScore();
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
  <div class="page">
    <div class="nav">
      <div class="score fade-in" @click="pauseLevel()" :title="i18n.t('campaign.button.pause')">
        <div class="current">
          <span class="material-symbols-rounded">pause_circle</span>
          <div id="timer"></div>
        </div>
        <div class="record" v-if="record">
          <span class="material-symbols-rounded">star</span>
          <div v-html="record"></div>
        </div>
      </div>
      <BubbleButtonCheckpoint />
      <BubbleStats />
      <BubbleButtonSettings class="button right fade-in" />
    </div>
    <div class="footer">
      <div id="credit" class="credit button fade-in disabled" v-html="credit" v-if="credit"></div>
      <BubbleControls />
    </div>
  </div>
</template>