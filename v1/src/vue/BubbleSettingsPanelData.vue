<script setup>
  import { useI18n } from 'vue-i18n';

  const i18n = useI18n({ useScope: 'global' });
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
      <div class="option gap">
        <button @click="backupToFile">
          <span class="material-symbols-rounded">folder</span>
          {{ i18n.t('settings.data.file') }}
        </button>
        <button v-if="hasChromeStorage()" @click="backupToChrome">
          <span class="material-symbols-rounded">cloud_done</span>
          {{ i18n.t('settings.data.google') }}
        </button>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label>{{ i18n.t('settings.data.restore_from') }}</label>
      </div>
      <div class="option gap">
        <button @click="restoreFromFile">
          <span class="material-symbols-rounded">folder</span>
          {{ i18n.t('settings.data.file') }}
        </button>
        <button v-if="hasChromeStorage()" @click="restoreFromChrome">
          <span class="material-symbols-rounded">cloud_done</span>
          {{ i18n.t('settings.data.google') }}
        </button>
      </div>
    </div>
  </div>
</template>