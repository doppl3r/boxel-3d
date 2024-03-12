<script setup>
  import { ref, onMounted } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';

  // Add event listener(s)
  window.addEventListener('showTip', function(e) { showTip(e.detail.text) });

  // Show tip from custom event
  function showTip(text) {
    app.play = false;
    app.timer.pause();

    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('addPopup', {
      detail: {
        text: text,
        inputs: [{ type: 'button', value: 'Continue', callback: function() {
          app.ui.play();
          window.dispatchEvent(new CustomEvent('closePopup'));
        }}]
      }
    }));
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    app.ui.canvas.removeClass('hidden');
  })
</script>

<template>
  <div class="campaign dashboard">
    <div class="background"></div>
    <div id="timer"></div>
    <div id="credit"></div>
    <div id="speedometer"><span id="speed"></span></div>
    <div class="buttons">
      <a class="button top-left" action="pause-campaign" title="Pause (ESC)"><img src="/img/svg/pause.svg"></a>
      <OriginButtonSettings class="button top-right" />
    </div>
  </div>
</template>