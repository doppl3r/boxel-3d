<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';

  // Initialize attributes
  var text = ref('');
  var tab = ref('gameplay');
  var inputs = ref([]);
  var isOpen = ref(false);
  var settings = ref();

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('openSettings', openSettings);
	  window.addEventListener('closeSettings', closeSettings);
    window.addEventListener('keydown', keydown);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('openSettings', openSettings);
	  window.removeEventListener('closeSettings', closeSettings);
    window.removeEventListener('keydown', keydown);
  }

  function openSettings(e) {
    isOpen.value = true;
    settings.value = app.storage.getSettings();

    // Trigger opened event
    setTimeout(function() {
      window.dispatchEvent(new CustomEvent('settingsOpened'));
    }, 100);
  }

  function closeSettings() {
    isOpen.value = false;

    // Trigger opened event
    setTimeout(function() {
      window.dispatchEvent(new CustomEvent('settingsClosed'));
    }, 100);
  }

  function runCallback(callback, e) {
    if (callback == null) callback = closeSettings;
    callback(e);
  }

  function runLastInputCallback(e) {
    var lastInput = inputs.value[inputs.value.length - 1];
    if (lastInput) runCallback(lastInput.callback, e);
    else closeSettings();
  }

  function keydown(e) {
    if (isOpen.value == true) {
      var jumpKeys = ['Space', 'Enter', 'Escape'];
      if (jumpKeys.indexOf(e.code) > -1) {
        // Close popup
        e.preventDefault();
        runLastInputCallback(e);
      }
    }
  }

  function updateSettings(e) {
    var el = e.target;
    var key = el.id;
    var value = el.value;
    settings.value[key] = value;
  }

  onMounted(function() {
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <Transition name="fade">
    <div class="popup settings" v-if="isOpen == true">
      <div class="background" @click="runLastInputCallback"></div>
      <div class="container">
        <div class="tabs">
          <div class="tab" :class="{ 'selected': tab == 'gameplay' }" @click="tab = 'gameplay'">
            <span class="material-symbols-rounded">gamepad</span>
          </div>
          <div class="tab" :class="{ 'selected': tab == 'graphics' }" @click="tab = 'graphics'">
            <span class="material-symbols-rounded">visibility</span>
          </div>
          <div class="tab" :class="{ 'selected': tab == 'audio' }" @click="tab = 'audio'">
            <span class="material-symbols-rounded">volume_up</span>
          </div>
          <div class="tab" :class="{ 'selected': tab == 'data' }" @click="tab = 'data'">
            <span class="material-symbols-rounded">save</span>
          </div>
        </div>
        <div class="content compact">
          <div class="panel" v-if="tab == 'gameplay'">
            <p>Gameplay settings</p>
            <div class="group">
              <div class="option">
                <input type="checkbox" id="motion" :checked="settings.motion == true" @change="updateSettings($event)">
                <label for="motion">Reduce Motion</label>
              </div>
              <div class="option">
                <input type="checkbox" id="speedrun" :checked="settings.speedrun == true" @change="updateSettings($event)">
                <label for="speedrun">Speedrun Mode</label>
              </div>
            </div>
          </div>
          <div class="panel" v-if="tab == 'graphics'">
            <p>Graphics settings</p>
            <div class="group">
              <div class="option">
                <label for="quality">Quality</label>
                <input type="range" id="quality" min="1" max="10" step="1" :value="settings.quality" @change="updateSettings($event)">
                <label for="quality">{{ (settings.quality * 10) }}%</label>
              </div>
              <div class="option">
                <input type="checkbox" id="fullscreen" :checked="settings.fullscreen == true" @change="updateSettings($event)">
                <label for="fullscreen">Fullscreen</label>
              </div>
              <div class="option">
                <input type="checkbox" id="stats" :checked="settings.stats == true" @change="updateSettings($event)">
                <label for="stats">Show FPS</label>
              </div>
              <div class="option">
                <input type="checkbox" id="theme" :checked="settings.theme == 'bubble'" @change="updateSettings($event)">
                <label for="theme">New UI</label>
              </div>
            </div>
          </div>
          <div class="panel" v-if="tab == 'audio'">
            <p>Audio settings</p>
            <div class="group">
              <div class="option">
                <label for="volume">Volume</label>
                <input type="range" id="volume" min="0" max="1" step="0.1" :value="settings.volume" @change="updateSettings($event)">
                <label for="volume">{{ (settings.volume * 100) }}%</label>
              </div>
            </div>
          </div>
          <div class="panel" v-if="tab == 'data'">
            <p>Data settings</p>
            <div class="group">
              <div class="option">
                <label>Backup to...</label>
                <input type="button" value="Google">
                <input type="button" value="File">
              </div>
            </div>
            <div class="group">
              <div class="option">
                <label>Import from...</label>
                <input type="button" value="Google">
                <input type="button" value="File">
              </div>
            </div>
          </div>
          <a class="close" @click="runLastInputCallback">
            <span class="material-symbols-rounded">close</span>
          </a>
        </div>
      </div>
    </div>
  </Transition>
</template>
<style>
  .fade-enter-active, .fade-leave-active { transition: opacity 0.1s ease; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
</style>