<script setup>
  var props = defineProps(['settings']);
</script>
<template>
  <div class="panel">
    <p>Audio</p>
    <div class="group">
      <div class="option">
        <label for="volume">Volume</label>
      </div>
      <div class="option">
        <input type="range" id="volume" min="0" max="1" step="0.1" :value="settings.volume" @change="$emit('updateSettings', $event)">
        <label for="volume">{{ (settings.volume * 100) }}%</label>
      </div>
    </div>
  </div>
</template>