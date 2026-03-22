<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BubbleSettingsTabs from './BubbleSettingsTabs.vue';
  import BubbleSettingsPanelGraphics from './BubbleSettingsPanelGraphics.vue';
  import BubbleSettingsPanelMultiplayer from './BubbleSettingsPanelMultiplayer.vue';
  import BubbleSettingsPanelControls from './BubbleSettingsPanelControls.vue';
  import BubbleSettingsPanelAudio from './BubbleSettingsPanelAudio.vue';
  import BubbleSettingsPanelData from './BubbleSettingsPanelData.vue';
  import BubbleSettingsPanelLanguage from './BubbleSettingsPanelLanguage.vue';

  // Initialize attributes
  const i18n = useI18n({ useScope: 'global' });
  var tab = ref('audio');
  var inputs = ref([]);
  var isOpen = ref(false);
  var settings = ref({});
  var pendingScrollTarget = null;

  function parseOpenSettingsDetail(detail) {
    if (typeof detail !== 'string' || detail.length === 0) return;
    var parts = detail.split(':');
    if (parts[0]) tab.value = parts[0];
    pendingScrollTarget = parts[1] || null;
  }

  function scrollToSettingsTarget(id) {
    var container = document.querySelector('.popup.settings .content');
    if (container == null || id == null || id === '') return;
    var target = container.querySelector('#' + id);
    if (target == null) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof target.focus == 'function') target.focus({ preventScroll: true });
  }

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
    pendingScrollTarget = null;
    parseOpenSettingsDetail(e?.detail);
    window.dispatchEvent(new CustomEvent('beforeSettingsOpened'));
    
    // Trigger opened event
    setTimeout(function() {
      scrollToSettingsTarget(pendingScrollTarget);
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

  function changeTab(name) {
    tab.value = name;
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
      if (e.target.tagName != 'INPUT' && e.target.tagName != 'TEXTAREA') {
        var exitKeys = ['Escape', 'KeyE'];
        if (exitKeys.indexOf(e.code) > -1) {
          // Close popup
          e.preventDefault();
          runLastInputCallback(e);
        }
      }
    }
  }

  function updateSettings(e, choices, callback = function(){}) {
    var el = e.target;
    var key = el.id;
    var value = el.value;
    var type = e.target.type;

    // Resolve range values
    if (type == 'range') value = parseFloat(value);
    
    // Resolve checkbox values
    if (type == 'checkbox') value = el.checked;
    if (choices) value = choices[value];

    // Store settings
    settings.value[key] = value;
    app.updateSettings(settings.value);
    callback();
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
    <div class="popup settings" v-show="isOpen == true">
      <div class="background" @click="runLastInputCallback"></div>
      <div class="container">
        <BubbleSettingsTabs :tab="tab" @changeTab="changeTab" />
        <div class="content compact">
          <BubbleSettingsPanelAudio :settings="settings" v-show="tab == 'audio'" @updateSettings="updateSettings" />
          <BubbleSettingsPanelGraphics :settings="settings" v-show="tab == 'graphics'" @updateSettings="updateSettings" />
          <BubbleSettingsPanelControls :settings="settings" v-show="tab == 'controls'" @updateSettings="updateSettings" />
          <BubbleSettingsPanelMultiplayer :settings="settings" v-show="tab == 'multiplayer'" @updateSettings="updateSettings" />
          <BubbleSettingsPanelData :settings="settings" v-show="tab == 'data'" @updateSettings="updateSettings" />
          <BubbleSettingsPanelLanguage :settings="settings" v-show="tab == 'language'" @updateSettings="updateSettings" />
          <a class="close" @click="runLastInputCallback" :title="i18n.t('popup.button.close')">
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