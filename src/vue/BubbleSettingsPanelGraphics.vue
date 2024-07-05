<script setup>
  var props = defineProps(['settings']);

  function isFullscreen() {
    return location.href.includes('?fullscreen=true');
  }

  function openLink(url) {
    if (chrome.tabs) chrome.tabs.create({ url: url });
    else window.open(url, '_blank');
  }

  function openFullscreen() {
    openLink(location.href + '?fullscreen=true');
  }

  function setTheme() {
    window.dispatchEvent(new CustomEvent('setTheme'));
  }

  function showHelpers() {
    app.level.showHelpers(props['settings'].debug);
  }
</script>
<template>
  <div class="panel">
    <p>Graphics settings</p>
    <div class="group">
      <div class="option">
        <label for="quality">Quality</label>
      </div>
      <div class="option">
        <input type="range" id="quality" min="1" max="10" step="1" :value="settings.quality" @change="$emit('updateSettings', $event)">
        <label for="quality">{{ (settings.quality * 10) }}%</label>
      </div>
      <div class="option" v-if="isFullscreen() == false">
        <input type="checkbox" id="fullscreen" @change="openFullscreen()">
        <label for="fullscreen">Fullscreen</label>
      </div>
      <div class="option">
        <input type="checkbox" id="theme" :checked="settings.theme == 'origin'" @change="$emit('updateSettings', $event, { true: 'origin', false: 'bubble' }, setTheme)">
        <label for="theme">Old UI</label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label>Developer Tools</label>
      </div>
      <div class="option">
        <input type="checkbox" id="stats" :checked="settings.stats == true" @change="$emit('updateSettings', $event)">
        <label for="stats">Show FPS</label>
      </div>
      <div class="option">
        <input type="checkbox" id="debug" :checked="settings.debug == true" @change="$emit('updateSettings', $event, null, showHelpers)">
        <label for="debug">Debug Mode</label>
      </div>
    </div>
  </div>
</template>