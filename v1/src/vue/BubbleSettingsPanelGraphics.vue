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
        <label for="scale">{{ i18n.t('settings.graphics.scale') }}</label>
      </div>
      <div class="option">
        <input type="range" id="scale" min="0.5" max="1.5" step="0.125" :value="settings.scale" @change="$emit('updateSettings', $event)">
        <label for="scale">{{ (settings.scale * 100) }}%</label>
      </div>
    </div>

    <div class="group">
      <div class="option">
        <label for="motion">{{ i18n.t('settings.graphics.camera') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="motion" :checked="settings.motion == true" @change="$emit('updateSettings', $event)">
        <label for="motion">{{ i18n.t('settings.graphics.auto_rotate') }}</label>
      </div>
      <div class="option">
        <label for="zoom">{{ i18n.t('settings.graphics.zoom') }}</label>
      </div>
      <div class="option">
        <input type="range" id="zoom" min="80" max="280" step="20" :value="settings.zoom" @input="$emit('updateSettings', $event)">
        <label for="zoom">{{ (settings.zoom) }}</label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label>{{ i18n.t('settings.graphics.developer_tools') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="stats" :checked="settings.stats == true" @change="$emit('updateSettings', $event)">
        <label for="stats">{{ i18n.t('settings.graphics.show_fps') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="debug" :checked="settings.debug == true" @change="$emit('updateSettings', $event, null, showHelpers)">
        <label for="debug">{{ i18n.t('settings.graphics.debug_mode') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="theme" :checked="settings.theme == 'origin'" @change="$emit('updateSettings', $event, { true: 'origin', false: 'bubble' }, setTheme)">
        <label for="theme">{{ i18n.t('settings.graphics.old_ui') }}</label>
      </div>
    </div>
  </div>
</template>