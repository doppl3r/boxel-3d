<script setup>
  import { useI18n } from 'vue-i18n';

  const i18n = useI18n();
  var props = defineProps(['tab']);
</script>

<template>
  <div class="tabs">
    <div class="tab" :class="{ 'selected': tab == 'audio' }" @click="$emit('changeTab', 'audio');">
      <label>{{ i18n.t('settings.audio.title') }}</label>
      <span class="material-symbols-rounded">volume_up</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'graphics' }" @click="$emit('changeTab', 'graphics');">
      <label>{{ i18n.t('settings.graphics.title') }}</label>
      <span class="material-symbols-rounded">visibility</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'multiplayer' }" @click="$emit('changeTab', 'multiplayer');">
      <label>{{ i18n.t('settings.multiplayer.title') }}</label>
      <span class="material-symbols-rounded">group</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'language' }" @click="$emit('changeTab', 'language');">
      <label>{{ i18n.t('settings.language.title') }}</label>
      <span class="material-symbols-rounded">translate</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'mods' }" @click="$emit('changeTab', 'mods');">
      <label>{{ i18n.t('settings.mods.title') }}</label>
      <span class="material-symbols-rounded">power</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'data' }" @click="$emit('changeTab', 'data');">
      <label>{{ i18n.t('settings.data.title') }}</label>
      <span class="material-symbols-rounded">save</span>
    </div>
  </div>
</template>