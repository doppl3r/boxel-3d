<script setup>
  import { ref } from 'vue';

  function showSettings() {
    var settings = app.storage.getSettings(app);
    var inputs = [
      { label: 'Master Volume', name: 'volume', type: 'range', min: 0, max: 1, step: 0.1, value: settings.volume, callback: function(e) { updateSettings('volume', e.target.value); }},
      { label: 'Graphic Quality', name: 'quality', type: 'range', min: 2, max: 10, value: settings.quality, callback: function(e) { updateSettings('quality', parseInt(e.target.value)); }},
      { label: 'Camera Motion', name: 'motion', type: 'range', min: 0, max: 1, value: settings.motion == true ? 1 : 0, callback: function(e) { updateSettings('motion', e.target.value == "1"); }},
      { label: 'Camera Zoom', disabled: app.level.zoom, name: 'zoom', type: 'range', min: 80, max: 280, step: 20, value: settings.zoom, callback: function(e) { updateSettings('zoom', e.target.value); }},
      { label: 'Show FPS', name: 'stats', type: 'range', min: 0, max: 1, value: settings.stats == true ? 1 : 0, callback: function(e) { updateSettings('stats', e.target.value == "1"); }},
      { label: 'New UI', name: 'theme', type: 'range', min: 0, max: 1, value: settings.theme == 'bubble' ? 1 : 0, callback: function(e) { updateSettings('theme', e.target.value == "1" ? 'bubble' : 'origin'); window.dispatchEvent(new CustomEvent('setTheme')); }}
    ];

    // Add more options for the level maker
    if (app.state == 'level-manager' || app.state == 'level-editor') {
      inputs.push(
        { label: 'Editor Snap', name: 'snap', type: 'range', min: 0, max: 16, step: 4, value: settings.snap, callback: function(e) {
          var snap = Number(e.target.value);
          if (snap == 0) snap = 1;
          e.target.title = snap;
          updateSettings('snap', snap);
        }},
      );
    }
    else if (app.state == 'campaign') {
      app.timer.pause();
      app.play = false;
    }

    // Add bottom button(s)
    inputs.push({ type: 'button', value: 'Close', callback: function(e) {
        // Resume campaign if settings was selected during gameplay
        if (app.state == 'campaign') app.resumeLevel();
        window.dispatchEvent(new CustomEvent('closePopup'));
      }
    });

    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: '<img src="../svg/gear.svg">',
        inputs: inputs
      }
    }));
  }

  function updateSettings(key, value) {
    var settings = app.storage.getSettings(app);
    settings[key] = value;
    app.updateSettings(settings);
  }
</script>

<template>
  <a @click="showSettings" title="Settings"><img :src="'../svg/gear.svg'"></a>
</template>