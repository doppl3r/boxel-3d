<script setup>
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';

  const i18n = useI18n({ useScope: 'global' });
  const restartRequired = ref(false);
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

  function loadClipboard() {
    var clipboard = localStorage.getItem('clipboard');
    if (clipboard == null || clipboard == '') clipboard = 'Hello, World!';
    return clipboard;
  }

  function saveClipboard(e) {
    var clipboard = e.target.value;
    localStorage.setItem('clipboard', clipboard);
  }

  function checkLevelPacks(e) {
    var levelPacks = localStorage.getItem('level_packs');

    // Set default level packs using placeholder
    if (levelPacks === null || levelPacks === '') {
      e.target.value = e.target.placeholder;
      saveLevelPacks(e);
    }
  }

  function loadLevelPacks() {
    var levelPacks = localStorage.getItem('level_packs');
    return levelPacks;
  }

  function saveLevelPacks(e) {
    var levelPacks = e.target.value;
    restartRequired.value = true;
    localStorage.setItem('level_packs', levelPacks);
  }

  function reloadPage() {
    window.location.reload();
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
    <div class="group">
      <div class="option">
        <label for="level_packs">
          <span class="material-symbols-rounded">link</span> {{ i18n.t('popup.text.level_packs') }}
        </label>
      </div>
      <div class="option gap wrap">
        <textarea
          :value="loadLevelPacks()"
          id="level_packs"
          @input="saveLevelPacks"
          @click="checkLevelPacks"
          placeholder="https://raw.githubusercontent.com/Charlieee1/Boxel-3d-Mods/refs/heads/main/community-levels/community-levels.json"
          spellcheck="false">
        </textarea>
        <button v-if="restartRequired" @click="reloadPage">
          <span class="material-symbols-rounded">refresh</span>
          {{ i18n.t('settings.data.reload') }}
        </button>
      </div>
    </div>
    <div class="group">
      <div class="option wrap">
        <label for="mods"><span class="material-symbols-rounded">assignment</span> {{ i18n.t('settings.mods.clipboard') }}</label>
        <textarea :value="loadClipboard()" id="mods" @input="saveClipboard" spellcheck="false"></textarea>
      </div>
    </div>
  </div>
</template>