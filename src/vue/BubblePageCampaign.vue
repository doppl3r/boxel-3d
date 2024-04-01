<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import BubbleButtonSettings from './BubbleButtonSettings.vue';
  import BubbleStats from './BubbleStats.vue';

  // Initialize variables
  var isClosed = ref(true); // Popup animation state

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('popupOpened', popupOpened);
    window.addEventListener('popupClosed', popupClosed);
    window.addEventListener('keydown', keydown);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('popupOpened', popupOpened);
    window.removeEventListener('popupClosed', popupClosed);
    window.removeEventListener('keydown', keydown);
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
  <div class="page">
    <div class="nav">
      <BubbleButtonSettings class="button right fade-in" />
    </div>
    <div class="footer">
      <BubbleStats />
    </div>
  </div>
</template>