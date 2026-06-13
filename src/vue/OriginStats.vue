<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';

  var isVisible = ref(false);
  var prevTime = Date.now();
  var running = false;
  var frames = 0;
  var fps = ref(0);

  function addEventListeners() {
    window.addEventListener('updateStatsVisibility', updateStatsVisibility);
  }
  
  function removeEventListeners() {
    window.removeEventListener('updateStatsVisibility', updateStatsVisibility);
  }

  function checkFPS() {
    if (running == true) {
      // Queue FPS check
      requestAnimationFrame(function() { checkFPS(); });
  
      // Calculate new time between frames
      var time = Date.now();
      frames++;
      if (time > prevTime + 1000) {
        fps.value = Math.round(( frames * 1000 ) / ( time - prevTime ));
        prevTime = time;
        frames = 0;
      }
    }
  }

  function start() {
    running = true;
    checkFPS();
  }

  function stop() {
    running = false;
  }

  function updateStatsVisibility() {
    var settings = app.storage.getSettings();
    isVisible.value = settings.stats;
  }

  onMounted(function() {
    start();
    updateStatsVisibility();
    addEventListeners();
  });
  
  onUnmounted(function() {
    stop();
    removeEventListeners();
  })
</script>

<template>
  <div class="stats" v-if="isVisible">
    <span class="fps">{{ fps }} FPS</span>
  </div>
</template>