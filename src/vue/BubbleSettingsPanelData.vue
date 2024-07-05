<script setup>
  var props = defineProps(['settings']);

  function hasChromeStorage() {
    return chrome.storage != null;
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
    <p>Data settings</p>
    <div class="group">
      <div class="option">
        <label>Backup to...</label>
      </div>
      <div class="option">
        <input type="button" value="File" @click="backupToFile">
        <input v-if="hasChromeStorage()" type="button" value="Google" @click="backupToChrome">
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label>Restore from...</label>
      </div>
      <div class="option">
        <input type="button" value="File" @click="restoreFromFile">
        <input v-if="hasChromeStorage()" type="button" value="Google" @click="restoreFromChrome">
      </div>
    </div>
  </div>
</template>