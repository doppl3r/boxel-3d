<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';

  // Initialize variables
  var credit = ref('');

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('setCredit', setCredit);
    window.addEventListener('keydown', keydown);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('setCredit', setCredit);
    window.removeEventListener('keydown', keydown);
  }

  function setCredit(e) {
    if (e.detail.text) credit.value = e.detail.text;
  }

  function pauseLevel() {
    app.pauseLevel();
  }

  function keydown(e) {
    var jumpKeys = ['Space', 'Enter', 'ArrowUp', 'KeyW'];
    if (jumpKeys.indexOf(e.code) > -1) {
      // Jump if one of the keys is pressed
      if (app.play == true) {
        app.player.jump();
      }
    }

    if (e.code == 'Escape') {
      if (app.play == true) { pauseLevel(); }
    }
    else if (e.code == 'KeyE') {
      if (app.play == true) app.exitCampaign();
    }
    else if (e.code == 'KeyR') {
      app.level.retryLevel();
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
    <div class="background"></div>
    <div id="timer"></div>
    <div id="credit" class="fade-in" v-html="credit" v-if="credit"></div>
    <div id="speedometer"><span id="speed"></span></div>
    <div class="buttons">
      <a class="button top-left" @click="pauseLevel" title="Pause (ESC)"><img src="/img/svg/pause.svg"></a>
      <OriginButtonSettings class="button top-right" />
    </div>
  </div>
</template>