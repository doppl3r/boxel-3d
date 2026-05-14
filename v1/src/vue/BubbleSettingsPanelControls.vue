<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  
  const i18n = useI18n({ useScope: 'global' });
  const props = defineProps(['settings']);
  const emit = defineEmits(['updateSettings']);
  const isInputBufferValid = ref(false);

  function onChange(...args) {
    // Emit event to parent component
    emit(...args);

    // Update settings state
    onSettingsOpened();
  }

  function onSettingsOpened() {
    isInputBufferValid.value = !app.isInputBufferValid();
  }

  function onSettingsClosed() {
    isInputBufferValid.value = false;
  }

  function setLayout(e) {
    const el = e.target;
    const controls = props.settings.controls;
    controls.reverse = el.checked;
    onChange('updateSettings', e, {
      true: { ...controls, reverse: true },
      false: { ...controls, reverse: false }
    });

    // Dispatch control event
    window.dispatchEvent(new CustomEvent('updateControls'));
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
    <p>
      {{ i18n.t('settings.controls.title') }}
    </p>
    <div class="group">
      <div class="option">
        <label>{{ i18n.t('settings.controls.controller') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="controls" :checked="settings.controls?.reverse == true" @change="setLayout">
        <label for="controls">{{ i18n.t('settings.controls.reverse') }}</label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label for="buffer">
          <span v-if="isInputBufferValid" class="material-symbols-rounded" :data-title="i18n.t('settings.controls.buffer_badge')">verified_off</span>
          {{ i18n.t('settings.controls.buffer') }}
        </label>
      </div>
      <div class="option">
        <input type="range" id="buffer" min="0" max="100" step="10" :value="settings.buffer" @input="onChange('updateSettings', $event)">
        <label for="buffer">{{ settings.buffer }}ms</label>
      </div>
    </div>
  </div>
</template>