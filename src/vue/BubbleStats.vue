<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue';

  var isVisible = ref(false);
  var prevTime = Date.now();
  var running = false;
  var frames = 0;
  var mode = ref(app?.stats?.mode || 'fps');
  var fps = ref(0);
  var position = ref('');
  var coordinates = computed(() => {
    return '<span>' + position.value.split('').join('</span><span>') + '</span>'
  })

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
      if (mode.value == 'fps') {
        var time = Date.now();
        frames++;
        if (time > prevTime + 1000) {
          fps.value = Math.round(( frames * 1000 ) / ( time - prevTime ));
          prevTime = time;
          frames = 0;
        }
      }
      else {
        position.value = `x:${ Math.floor(app.player.position.x) }, y:${ Math.floor(app.player.position.y) }, z:${ Math.floor(app.player.position.z) }`;
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
    var settings = app.storage.getSettings(app);
    isVisible.value = settings.stats;
  }

  function changeStats() {
    if (mode.value == 'fps') mode.value = 'position'; 
    else mode.value = 'fps';
    
    // Store stats mode in global memory
    app.stats = Object.assign(app.stats || {}, { mode: mode.value });
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
  <a class="stats button left fade-in" :class="mode" v-if="isVisible" @click="changeStats">
    <span class="material-symbols-rounded" v-if="mode == 'fps'">speed</span>
    <span class="material-symbols-rounded" v-if="mode == 'position'">my_location</span>
    <span class="fps" v-if="mode == 'fps'">{{ fps }} FPS</span>
    <div class="position" v-if="mode == 'position'" v-html="coordinates"></div>
  </a>
</template>

<style lang="scss" scoped>
  .stats {
    gap: 0;
    height: 2em !important;
    width: auto !important;
    padding: 0.25em 1em 0.25em 0em;

    .material-symbols-rounded {
      background-color: #4CA9FF;
      box-shadow: 0em 0.125em 0em rgba(0, 0, 0, 0.25);
      border-radius: 0.5em;
      width: 1.5em;
      height: 1.5em;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.5em;
    }

    > * { pointer-events: none; }

    .position {
      :deep(span) {
        display: inline-block;
        min-width: 0.75em;
      }
    }
  }
</style>