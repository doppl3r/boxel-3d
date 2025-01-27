<script setup>
  import { ref } from 'vue';

  // Initialize progress variable (urls, index, max, percent)
  var progress = ref({ urls: '', index: 0, max: 1, percent: 0 })

  function updateLoading(data) {
    progress.value = data;
  }
  
  function isFinished() {
    return progress.value.percent == 100;
  }

  // Refresh UI when game object dispatches custom events
  window.addEventListener('updateLoading', function(e) {
    updateLoading(e.detail);
  });
</script>

<template>
  <Transition name="fade-loading">
    <div class="loading" v-if="isFinished() == false">
      <div class="bar">
        <div class="boxel" :style="{ left: `calc(${ progress.percent }% - 1em)` }"></div>
        <div class="progress" :style="{ width: progress.percent + '%' }"></div>
      </div>
      <div class="label">Loading: {{ progress.percent }}%</div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
  .fade-loading-enter-active,
  .fade-loading-leave-active { transition: opacity 0.5s ease; }
  .fade-loading-enter-from,
  .fade-loading-leave-to { opacity: 0; }

  .loading {
    background-color: #000000;
    display: flex;
    flex-direction: column;
    font-family: 'Comfortaa-Bold';
    align-items: center;
    justify-content: center;
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;

    .bar {
      width: 50%;
      padding: 0.25em;
      margin: 1em 0em;
      border: 0.25em solid #fff;
      border-radius: 0.5em;
      position: relative;

      .boxel {
        animation: spin 1s linear infinite;
        background-color: #ffcb4c;
        border-radius: 0.25em;
        bottom: 2em;
        height: 2em;
        position: absolute;
        transition: all 0.25s ease;
        width: 2em;
      }

      .progress {
        background-color: #ffffff;
        border-radius: 0.125em;
        transition: all 0.25s ease;
        height: 1em;
      }
    }

    .label {
      color: #ffffff;
      font-size: 1em;
    }
  }

  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>