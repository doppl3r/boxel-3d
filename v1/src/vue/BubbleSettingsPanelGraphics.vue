<script setup>
  import { useI18n } from 'vue-i18n';

  const i18n = useI18n({ useScope: 'global' });
  var props = defineProps(['settings']);

  function setTheme() {
    window.dispatchEvent(new CustomEvent('setTheme'));
  }

  function showHelpers() {
    app.level.showHelpers(props['settings'].debug);
  }
</script>
<template>
  <div class="panel">
    <p>{{ i18n.t('settings.graphics.title') }}</p>
    <div class="group">
      <div class="option">
        <label for="quality">{{ i18n.t('settings.graphics.quality') }}</label>
      </div>
      <div class="option">
        <input type="range" id="quality" min="1" max="10" step="1" :value="settings.quality" @change="$emit('updateSettings', $event)">
        <label for="quality">{{ (settings.quality * 10) }}%</label>
      </div>
      <div class="option">
        <label for="buffer">{{ i18n.t('settings.graphics.buffer') }}</label>
      </div>
      <div class="option">
        <input type="range" id="buffer" min="0" max="100" step="10" :value="settings.buffer" @change="$emit('updateSettings', $event)">
        <label for="buffer">{{ settings.buffer }}ms</label>
      </div>
      <div class="option">
        <label for="motion">{{ i18n.t('settings.graphics.camera') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="motion" :checked="settings.motion == true" @change="$emit('updateSettings', $event)">
        <label for="motion">{{ i18n.t('settings.graphics.auto_rotate') }}</label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label>{{ i18n.t('settings.graphics.developer_tools') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="theme" :checked="settings.theme == 'origin'" @change="$emit('updateSettings', $event, { true: 'origin', false: 'bubble' }, setTheme)">
        <label for="theme">{{ i18n.t('settings.graphics.old_ui') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="stats" :checked="settings.stats == true" @change="$emit('updateSettings', $event)">
        <label for="stats">{{ i18n.t('settings.graphics.show_fps') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="debug" :checked="settings.debug == true" @change="$emit('updateSettings', $event, null, showHelpers)">
        <label for="debug">{{ i18n.t('settings.graphics.debug_mode') }}</label>
      </div>
    </div>
  </div>
</template>