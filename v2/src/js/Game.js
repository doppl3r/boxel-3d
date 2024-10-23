import { Loop } from './Loop';
import { AssetLoader } from './loaders/AssetLoader.js';
import { Stage } from './Stage.js';

class Game {
  constructor(onLoad) {
    this.loop = new Loop();
    this.stage = new Stage();
    this.assets = new AssetLoader(this.onLoad.bind(this, onLoad));
  }

  init(canvas) {
    // Initialize components
    this.stage.init(canvas);

    // Load public assets with callbacks (onLoad, onProgress, onError)
    this.assets.load({
      models: '../json/assets-models.json',
      textures: '../json/assets-textures.json',
      audio: '../json/assets-audio.json'
    });
  }

  update(data = { delta: 1 / 60 }) {
    // Update entity physics
    this.stage.update(data.delta);
  }

  render(data = { delta: 1 / 60, alpha: 0 }) {
    // Update entity 3D objects
    this.stage.render(data.delta, data.alpha);
  }

  onLoad(onLoad) {
    // Add and start game loops
    this.loop.add(this.update.bind(this), 60); // Physics
    this.loop.add(this.render.bind(this), -1); // Render
    this.loop.start();
  
    // Run optional callback
    if (typeof onLoad == 'function') onLoad();
  }
}

export { Game };