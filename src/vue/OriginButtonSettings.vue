<script setup>
  import { ref } from 'vue';

  function showSettings() {
    var settings = app.storage.getSettings(app);
    var inputs = [
      { label: 'Master Volume', name: 'volume', type: 'range', min: 0, max: 1, step: 0.1, value: settings.volume, callback: function(e) { updateSettings('volume', e.target.value); }},
      { label: 'Graphic Quality', name: 'quality', type: 'range', min: 2, max: 10, value: settings.quality, callback: function(e) { updateSettings('quality', e.target.value); }},
      { label: 'Camera Rotation', name: 'motion', type: 'range', min: 0, max: 1, value: settings.motion, callback: function(e) { updateSettings('motion', e.target.value); }}
    ];

    // Add more options for the level maker
    if (app.state == 'level-manager' || app.state == 'level-editor') {
      inputs.push(
        { label: 'Editor Snap', name: 'snap', type: 'range', min: 1, max: 8, step: 7, value: settings.snap, callback: function(e) { updateSettings('snap', e.target.value); }},
      );
    }
    else if (app.state == 'campaign') {
      app.timer.pause();
      app.play = false;
    }

    // Add bottom button(s)
    inputs.push({ type: 'button', value: 'Close', callback: function(e) {
        // Resume campaign if settings was selected during gameplay
        app.resumeLevel();
        window.dispatchEvent(new CustomEvent('closePopup'));
      }
    });

    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('addPopup', {
      detail: {
        text: '<img src="/img/svg/gear.svg">',
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
  <a @click="showSettings" title="Settings"><img src="/img/svg/gear.svg"></a>
</template>