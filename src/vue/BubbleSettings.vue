<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';

  // Initialize attributes
  var text = ref('');
  var tab = ref('graphics');
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
    window.dispatchEvent(new CustomEvent('beforeSettingsOpened'));
    
    // Trigger opened event
    setTimeout(function() {
      window.dispatchEvent(new CustomEvent('settingsOpened'));
    }, 100);
  }
  
  function closeSettings() {
    isOpen.value = false;
    window.dispatchEvent(new CustomEvent('beforeSettingsClosed'));

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
      var jumpKeys = ['Escape'];
      if (jumpKeys.indexOf(e.code) > -1) {
        // Close popup
        e.preventDefault();
        runLastInputCallback(e);
      }
    }
  }

  function updateSettings(e, options, callback = function(){}) {
    var el = e.target;
    var key = el.id;
    var value = el.value;
    var type = e.target.type;

    // Resolve range values
    if (type == 'range') value = parseFloat(value);
    
    // Resolve checkbox values
    if (type == 'checkbox') value = el.checked;
    if (options) value = options[value];

    // Store settings
    settings.value[key] = value;
    app.updateSettings(settings.value);
    callback();
  }

  function openLink(url) {
    if (chrome.tabs) chrome.tabs.create({ url: url });
    else window.open(url, '_blank');
  }

  function openFullscreen() {
    openLink(location.href + '?fullscreen=true');
  }

  function setTheme() {
    window.dispatchEvent(new CustomEvent('setTheme'));
  }

  function isFullscreen() {
    return location.href.includes('?fullscreen=true');
  }

  function showHelpers() {
    app.level.showHelpers(settings.value.debug);
  }

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

  function loadMods() {
    var mods = localStorage.getItem('mods');
    if (mods == null || mods == '') mods = 'app.loop.speed = 2;';
    return mods;
  }

  function saveMods(e) {
    var mods = e.target.value;
    localStorage.setItem('mods', mods);
  }

  onMounted(function() {
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <Transition name="fade-settings">
    <div class="popup settings" v-if="isOpen == true">
      <div class="background" @click="runLastInputCallback"></div>
      <div class="container">
        <div class="tabs">
          <div class="tab" :class="{ 'selected': tab == 'graphics' }" @click="tab = 'graphics'">
            <span class="material-symbols-rounded">page_info</span>
          </div>
          <div class="tab" :class="{ 'selected': tab == 'gameplay' }" @click="tab = 'gameplay'">
            <span class="material-symbols-rounded">gamepad</span>
          </div>
          <div class="tab" :class="{ 'selected': tab == 'audio' }" @click="tab = 'audio'">
            <span class="material-symbols-rounded">volume_up</span>
          </div>
          <div class="tab" :class="{ 'selected': tab == 'data' }" @click="tab = 'data'">
            <span class="material-symbols-rounded">save</span>
          </div>
        </div>
        <div class="content compact">
          <div class="panel" v-if="tab == 'graphics'">
            <p>Graphics settings</p>
            <div class="group">
              <div class="option">
                <label for="quality">Quality</label>
              </div>
              <div class="option">
                <input type="range" id="quality" min="1" max="10" step="1" :value="settings.quality" @change="updateSettings($event)">
                <label for="quality">{{ (settings.quality * 10) }}%</label>
              </div>
              <div class="option" v-if="isFullscreen() == false">
                <input type="checkbox" id="fullscreen" @change="openFullscreen()">
                <label for="fullscreen">Fullscreen</label>
              </div>
              <div class="option">
                <input type="checkbox" id="theme" :checked="settings.theme == 'origin'" @change="updateSettings($event, { true: 'origin', false: 'bubble' }, setTheme)">
                <label for="theme">Old UI</label>
              </div>
            </div>
            <div class="group">
              <div class="option">
                <label>Developer Tools</label>
              </div>
              <div class="option">
                <input type="checkbox" id="stats" :checked="settings.stats == true" @change="updateSettings($event)">
                <label for="stats">Show FPS</label>
              </div>
              <div class="option">
                <input type="checkbox" id="debug" :checked="settings.debug == true" @change="updateSettings($event, null, showHelpers)">
                <label for="debug">Debug Mode</label>
              </div>
            </div>
          </div>
          <div class="panel" v-if="tab == 'gameplay'">
            <p>Gameplay settings</p>
            <div class="group">
              <div class="option">
                <input type="checkbox" id="motion" :checked="settings.motion == true" @change="updateSettings($event)">
                <label for="motion">Camera Motion</label>
              </div>
            </div>
            <p>Mods</p>
            <div class="group">
              <div class="option">
                <label for="mods"><span class="material-symbols-rounded">assignment</span> Clipboard</label>
                <textarea :value="loadMods()" id="mods" @change="saveMods" spellcheck="false"></textarea>
              </div>
            </div>
            <div class="group">
              <div class="option">
                <label><span class="material-symbols-rounded">security</span> For your security, mods must be manually loaded each time the game is launched.</label>
              </div>
            </div>
            <div class="group">
              <div class="option">
                <label><span class="material-symbols-rounded">content_copy</span> Copy mods from trusted websites and paste them in the clipboard for later.<br><br>Trusted mods: <a href="https://github.com/Charlieee1/Boxel-3d-Mods/" target="_blank">github.com/Charlieee1</a></label>
              </div>
            </div>
            <div class="group">
              <div class="option">
                <label><span class="material-symbols-rounded">arrow_selector_tool</span> Right-click this game and select <em>Inspect</em>.</label>
              </div>
            </div>
            <div class="group">
              <div class="option">
                <label><span class="material-symbols-rounded">slideshow</span> Select the <em>Console</em> tab, paste mods from the clipboard, then press the <em>enter</em> key to load mods.</label>
              </div>
            </div>
          </div>
          <div class="panel" v-if="tab == 'audio'">
            <p>Audio settings</p>
            <div class="group">
              <div class="option">
                <label for="volume">Volume</label>
              </div>
              <div class="option">
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
          <a class="close" @click="runLastInputCallback">
            <span class="material-symbols-rounded">close</span>
          </a>
        </div>
      </div>
    </div>
  </Transition>
</template>
<style>
  .fade-settings-enter-active, .fade-settings-leave-active { transition: opacity 0.1s ease; }
  .fade-settings-enter-from, .fade-settings-leave-to { opacity: 0; }
</style>