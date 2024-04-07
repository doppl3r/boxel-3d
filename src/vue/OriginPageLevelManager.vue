<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';

  var items = ref([]); // return format = [{ key: '', level: '' }, ...]
  var emit = defineEmits(['setPage']);

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('keydown', keydown);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('keydown', keydown);
  }

  function updateLevelItems() {
    // Add empty level if none exist
    items.value = app.storage.getListOfLevels();
    if (items.value.length < 1) addLevel();
  }

  function addLevel() {
    var levelData = {};
    var key = null;
    app.level.createNewLevel(app);
    levelData = app.level.exportToJSON(app); // Init default data
    key = app.storage.setLevelData(null, levelData); // Store data and generate new key
    items.value.push({ key: key, level: levelData });
  }

  function importLevel(e) {
    var file = e.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function() {
        var level = JSON.parse(reader.result);
        app.level.clearLevel(app);
        app.level.key = null; // Reset key to generate new save key
        app.background.visible = false;
        app.level.entityFactory.color = '#620460';
        app.background.setTheme('background-classic');
        app.level.clearLevel(app);
        app.level.importFromJSON(level, app);
        app.levelHistory.save('Downloaded level', app);
        app.levelHistory.save('Loaded level', app); // Force dialog check to save
        app.resetScene(app);
        app.levelEditor.controlsOrbit.enabled = true;
        app.levelEditor.controlsOrbit.reset();
        emit('setPage', 'level-editor');
      }
      reader.readAsText(file);
    }
  }

  function editLevel(item) {
    var levelData = app.storage.getLevelData(item.key);
    var settings = app.storage.getSettings(app);
    levelData.name = item.level.name;
    app.level.entityFactory.color = '#620460';
    app.background.setTheme('background-classic');
    app.level.clearLevel(app);
    app.level.importFromJSON(levelData, app);
    app.level.key = item.key;
    app.updateSettings(settings, app);
    app.background.visible = false;
    app.levelHistory.save('Edited level', app);
    app.resetScene(app);
    app.levelEditor.controlsOrbit.enabled = true;
    app.levelEditor.controlsOrbit.reset();
    emit('setPage', 'level-editor');
  }

  function editLevelName(item, $event) {
    item.level.name = $event.target.value; // Update array item level name
    app.storage.updateLevelDataName(item.key, item.level.name);
  }

  function shareLevel(item) {
    editLevel(item);
    app.resetScene(app);
    app.storage.saveLevelToFile();
    emit('setPage', 'level-manager');
  }

  function deleteLevel(item) {
    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: 'Are you sure you want to <em>delete</em> this level?',
        inputs: [
          { value: 'Yes', type: 'button', callback: function() {
            var index = items.value.indexOf(item);
            items.value.splice(index, 1); // Remove item from array
            app.storage.removeLevelData(item.key);
            window.dispatchEvent(new CustomEvent('closePopup'));
          }},
          { value: 'No', type: 'button' }
        ]
      }
    }));
  }

  function exitLevelManager() {
    emit('setPage', 'home');
    // TODO: Remove event after developing Level Editor 2.0
    window.dispatchEvent(new CustomEvent('setTheme'));
  }

  function keydown(e) {
    if (e.code == 'Escape' || e.code == 'KeyE') {
      if (e.target.value) return; // Prevent exit while typing
      e.preventDefault();
      exitLevelManager();
    }
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    updateLevelItems();
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="level-manager">
    <div class="row top">
      <div class="col">
        <a class="item" @click="addLevel" title="Add level"><img src="/img/svg/add.svg"></a>
        <label class="item" title="Download level">
          <input @change="importLevel" class="hidden" type="file" accept="application/JSON">
          <img src="/img/svg/download.svg">
        </label>
        <a class="item" @click="exitLevelManager" title="Exit level manager (ESC)"><img src="/img/svg/home.svg"></a>
        <OriginButtonSettings class="item last" />
      </div>
    </div>
    <div class="row left">
      <div class="col">
        <template v-for="(item, key) of items">
          <div class="list-item">
            <input type="text" :value="item.level.name" @input="editLevelName(item, $event)">
            <a @click="editLevel(item)" class="item" title="Edit level"><img src="/img/svg/pencil.svg"></a>
            <a @click="shareLevel(item)" class="item" title="Share level"><img src="/img/svg/upload.svg"></a>
            <a @click="deleteLevel(item)" class="item" title="Delete level"><img src="/img/svg/trash.svg"></a>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>