import { Audio as TAudio, AudioListener, AudioLoader } from 'three';
import json from '../json/audio.json';

class Audio {
  constructor(manager) {
    this.cache = {};
    this.muted = false;
    this.listenerEffects = new AudioListener();
    this.listenerEffects.name = 'effects';
    this.listenerMusic = new AudioListener();
    this.listenerMusic.name = 'music';
    this.loader = new AudioLoader(manager);
    this.volume = 1;
    this.queue = [];
  }

  load() {
    var _this = this;
    for (const [key, value] of Object.entries(json)) {
      this.loader.load(value.url, function(buffer) {
        var listener;
        var sound;

        // Assign listener by type
        if (value?.userData?.type == 'music') listener = _this.listenerMusic;
        else if (value?.userData?.type == 'effect') listener = _this.listenerEffects;

        // Create sound with listener
        var sound = new TAudio(listener);
        sound.name = key;
        sound.setBuffer(buffer);

        // Add userData if available
        if (value.userData) {
          sound.userData = value.userData;
          if (sound.userData.loop) sound.setLoop(sound.userData.loop);
          if (sound.userData.volume) sound.setVolume(sound.userData.volume);
        }
        _this.cache[key] = sound;
      });
    }

    // Add event listener
    window.addEventListener('playAudio', function(e) { _this.play(e.detail.name, e.detail.queue); });
    window.addEventListener('setVolume', function(e) {
      _this.setMasterVolume(e.detail);
    });
    window.addEventListener('pointerup', function(e) { _this.playQueue(e.detail); });
  }

  play(name, options = {}) {
    options = Object.assign({
      detune: 0, // 100 = semitone, 1200 = octave
      queue: false
    }, options);

    if (options.queue == true) this.enqueue(name);
    else {
      const audio = this.cache[name];
      if (audio) {
        if (audio.isPlaying) audio.stop();
        audio.setDetune(options.detune);
        audio.play();
      }
    }
  }

  enqueue(name) {
    this.queue.push(name);
  }

  playQueue() {
    for (var i = 0; i < this.queue.length; i++) {
      this.play(this.queue[i]);
    }
    this.queue = [];
  }

  setMasterVolume(volume = 1, type = 'master') {
    let listener;

    // Set global volume (A zero value causes Audio "isPlaying" to be false, and will not play)
    if (volume == 0) volume = 0.000001;
    
    // Assign listener by type
    if (type == 'effects') listener = this.listenerEffects;
    else if (type == 'music') listener = this.listenerMusic;
    else if (type == 'master') this.volume = volume;

    // Set master volume (like 'listener.setMasterVolume')
    if (listener) {
      const currentTime = listener.context.currentTime;
      const gain = listener.gain.gain;
      gain.setTargetAtTime(volume * this.volume, currentTime, 0);
    }
  }

  getMasterVolume() {
    return this.volume;
  }
}

export { Audio };