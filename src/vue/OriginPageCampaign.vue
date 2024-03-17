<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';

  // Initialize variables
  var credit = ref('');

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('showTip', showTip);
    window.addEventListener('setCredit', setCredit);
  }

  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('showTip', showTip);
    window.removeEventListener('setCredit', setCredit);
  }

  // Show tip from custom event
  function showTip(e) {
    app.play = false;
    app.timer.pause();

    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('addPopup', {
      detail: {
        text: e.detail.text,
        inputs: [{ type: 'button', value: 'Continue', callback: function() {
          app.ui.play();
          window.dispatchEvent(new CustomEvent('closePopup'));
        }}]
      }
    }));
  }

  function setCredit(e) {
    if (e.detail.text) credit.value = e.detail.text;
  }

  function pause() {
    app.pause();
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    app.ui.canvas.removeClass('hidden');
    addEventListeners();
  })

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="campaign dashboard">
    <div class="background"></div>
    <div id="timer"></div>
    <div id="credit" class="fade-in" v-html="credit" v-if="credit"></div>
    <div id="speedometer"><span id="speed"></span></div>
    <div class="buttons">
      <a class="button top-left" @click="pause" title="Pause (ESC)"><img src="/img/svg/pause.svg"></a>
      <OriginButtonSettings class="button top-right" />
    </div>
  </div>
</template>