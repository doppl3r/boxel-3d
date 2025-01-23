<script setup>
  import { useI18n } from 'vue-i18n';

  const i18n = useI18n();
  var props = defineProps(['settings']);

  function hasChromeStorage() {
    return window.chrome?.storage != null;
  }

  function backupToFile() {
    app.storage.backupToFile();
  }

  function backupToChrome() {
    app.storage.backupToChrome();
  }

  function restoreFromFile() {
    app.storage.restoreFromFile();
  }

  function restoreFromChrome() {
    app.storage.restoreFromChrome();
  }
</script>
<template>
  <div class="panel">
    <p>{{ i18n.t('settings.data.title') }}</p>
    <div class="group">
      <div class="option">
        <label>{{ i18n.t('settings.data.backup_to') }}</label>
      </div>
      <div class="option">
        <input type="button" :value="i18n.t('settings.data.file')" @click="backupToFile">
        <input v-if="hasChromeStorage()" type="button" :value="i18n.t('settings.data.google')" @click="backupToChrome">
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label>{{ i18n.t('settings.data.restore_from') }}</label>
      </div>
      <div class="option">
        <input type="button" :value="i18n.t('settings.data.file')" @click="restoreFromFile">
        <input v-if="hasChromeStorage()" type="button" :value="i18n.t('settings.data.google')" @click="restoreFromChrome">
      </div>
    </div>
  </div>
</template>