<script setup>
  import { useI18n } from 'vue-i18n';
  
  const i18n = useI18n({ useScope: 'global' });
  const props = defineProps(['settings']);
  const emit = defineEmits(['updateSettings']);

  function setLayout(e) {
    const el = e.target;
    const controls = props.settings.controls;
    controls.reverse = el.checked;
    emit('updateSettings', e, {
      true: { ...controls, reverse: true },
      false: { ...controls, reverse: false }
    });

    // Dispatch control event
    window.dispatchEvent(new CustomEvent('updateControls'));
  }
</script>
<template>
  <div class="panel">
    <p>
      {{ i18n.t('settings.controls.title') }}
    </p>
    <div class="group">
      <div class="option">
        <label for="buffer">{{ i18n.t('settings.controls.buffer') }}</label>
      </div>
      <div class="option">
        <input type="range" id="buffer" min="0" max="100" step="10" :value="settings.buffer" @change="$emit('updateSettings', $event)">
        <label for="buffer">{{ settings.buffer }}ms</label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label>{{ i18n.t('settings.controls.controller') }}</label>
      </div>
      <div class="option">
        <input type="checkbox" id="controls" :checked="settings.controls?.reverse == true" @change="setLayout">
        <label for="controls">{{ i18n.t('settings.controls.reverse') }}</label>
      </div>
    </div>
  </div>
</template>