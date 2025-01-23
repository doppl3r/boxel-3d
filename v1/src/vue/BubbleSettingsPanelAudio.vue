<script setup>
  // Import audio data
  import { useI18n } from 'vue-i18n';
  import audio from '../json/audio.json';

  // Initialize props and emits
  const i18n = useI18n({ useScope: 'global' });
  const props = defineProps(['settings']);
  const emit = defineEmits(['updateSettings']);

  // Get music list from audio data
  var songs = Object.keys(audio).filter(key => audio[key].userData.type == 'music').map(key => ({ text: audio[key].userData.name, value: key }));

  function updateMusic(e) {
    // Pause current song
    songs.forEach(music => {
      app.assets.audio.cache[music.value].stop();
    });

    // Play new song
    app.assets.audio.cache[e.target.value].play();

    // Update settings
    emit('updateSettings', e)
  }
</script>
<template>
  <div class="panel">
    <p>{{ i18n.t('settings.audio.title') }}</p>
    <div class="group">
      <div class="option">
        <label for="music">{{ i18n.t('settings.audio.music') }}</label>
      </div>
      <div class="option">
        <select id="music" :value="settings.music" @change="updateMusic($event)">
          <option v-for="(music, index) of songs" :value="music.value" :key="music.value" :selected="settings.music == music.value">{{ music.text }}</option>
        </select>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label for="volume">{{ i18n.t('settings.audio.volume_main') }}</label>
      </div>
      <div class="option">
        <input type="range" id="volume" min="0" max="1" step="0.1" :value="settings.volume" @change="$emit('updateSettings', $event)">
        <label for="volume">{{ (settings.volume * 100) }}%</label>
      </div>
      <div class="option">
        <label for="volumeMusic">{{ i18n.t('settings.audio.volume_music') }}</label>
      </div>
      <div class="option">
        <input type="range" id="volumeMusic" min="0" max="1" step="0.1" :value="settings.volumeMusic" @change="$emit('updateSettings', $event)">
        <label for="volumeMusic">{{ (settings.volumeMusic * 100) }}%</label>
      </div>
      <div class="option">
        <label for="volumeEffects">{{ i18n.t('settings.audio.volume_effects') }}</label>
      </div>
      <div class="option">
        <input type="range" id="volumeEffects" min="0" max="1" step="0.1" :value="settings.volumeEffects" @change="$emit('updateSettings', $event)">
        <label for="volumeEffects">{{ (settings.volumeEffects * 100) }}%</label>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>