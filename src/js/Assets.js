import { LoadingManager } from 'three';
import { Audio } from './Audio.js';
import { Models } from './Models.js';
import { Textures } from './Textures.js';

class Assets {
  constructor() {
    this.manager = new LoadingManager();
    this.models = new Models(this.manager);
    this.textures = new Textures(this.manager);
    this.audio = new Audio(this.manager);
  }

  update(delta) {

  }

  load(callback = function() {}) {
    this.manager.onLoad = callback;
    this.manager.onProgress = this.loadProgress;
    this.audio.load();
    this.models.load();
    this.textures.load();
  }

  loadProgress(urls, index, max) {
    var percent = Math.ceil((index / max) * 100);
    window.dispatchEvent(new CustomEvent('updateLoading', { detail: { urls: urls, index: index, max: max, percent: percent }}));
  }
}

export { Assets };