<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';

  const i18n = useI18n({ useScope: 'global' });
  var props = defineProps(['settings']);
  var emit = defineEmits(['updateSettings']);

  const zoomDisabled = ref(false);
  const isDebugValid = ref(false);
  const isZoomValid = ref(false);

  function onChange(...args) {
    // Emit event to parent component
    emit(...args);

    // Update settings state
    onSettingsOpened();
  }

  function setTheme() {
    window.dispatchEvent(new CustomEvent('setTheme'));
  }

  function showHelpers() {
    app.level.showHelpers(props['settings'].debug);
  }

  function onSettingsOpened() {
    isDebugValid.value = app.isDebugValid();
    isZoomValid.value = app.isZoomValid();
    zoomDisabled.value = app.level.zoom !== undefined;
  }

  function onSettingsClosed() {
    isDebugValid.value = true;
    isZoomValid.value = true;
    zoomDisabled.value = false;
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    window.addEventListener('settingsOpened', onSettingsOpened);
    window.addEventListener('settingsClosed', onSettingsClosed);
  });

  onUnmounted(function() {
    window.removeEventListener('settingsOpened', onSettingsOpened);
    window.removeEventListener('settingsClosed', onSettingsClosed);
  });
</script>
<template>
  <div class="panel">
    <p>{{ i18n.t('settings.graphics.title') }}</p>
    <div class="group">
      <div class="option">
        <label for="quality">{{ i18n.t('settings.graphics.quality') }}</label>
      </div>
      <div class="option">
        <input type="range" id="quality" min="1" max="10" step="1" :value="settings.quality" @change="onChange('updateSettings', $event)">
        <label for="quality">{{ (settings.quality * 10) }}%</label>
      </div>
      <div class="option">
        <label for="scale">{{ i18n.t('settings.graphics.scale') }}</label>
      </div>
      <div class="option">
        <input type="range" id="scale" min="0.5" max="1.5" step="0.125" :value="settings.scale" @change="onChange('updateSettings', $event)">
        <label for="scale">{{ (settings.scale * 100) }}%</label>
      </div>
    </div>

    <div class="group">
      <div class="option">
        <label for="motion">{{ i18n.t('settings.graphics.camera') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="motion" :checked="settings.motion == true" @change="onChange('updateSettings', $event)">
        <label for="motion">{{ i18n.t('settings.graphics.auto_rotate') }}</label>
      </div>
      <div class="option">
        <label for="zoom">
          <span v-if="!isZoomValid" class="material-symbols-rounded" data-title="Verified badge requires 180 zoom">verified_off</span>
          <span v-if="zoomDisabled" class="material-symbols-rounded" data-title="Disabled by level">lock</span>
          <span>{{ i18n.t('settings.graphics.zoom') }}</span>
        </label>
      </div>
      <div class="option">
        <input type="range" id="zoom" min="80" max="280" step="20" :value="settings.zoom" :disabled="zoomDisabled" @input="onChange('updateSettings', $event)">
        <label for="zoom">{{ (settings.zoom) }}</label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label>{{ i18n.t('settings.graphics.developer_tools') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="stats" :checked="settings.stats == true" @change="onChange('updateSettings', $event)">
        <label for="stats">{{ i18n.t('settings.graphics.show_fps') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="debug" :checked="settings.debug == true" @change="onChange('updateSettings', $event, null, showHelpers)">
        <label for="debug">
          <span v-if="!isDebugValid" class="material-symbols-rounded" data-title="Verified badge requires debug disabled">verified_off</span>
          <span>{{ i18n.t('settings.graphics.debug_mode') }}</span>
        </label>
      </div>
      <div class="option">
        <input type="checkbox" id="theme" :checked="settings.theme == 'origin'" @change="onChange('updateSettings', $event, { true: 'origin', false: 'bubble' }, setTheme)">
        <label for="theme">{{ i18n.t('settings.graphics.old_ui') }}</label>
      </div>
    </div>
  </div>
</template>