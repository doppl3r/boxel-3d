import { Loop } from './Loop';
import { AssetLoader } from './loaders/AssetLoader.js';
import { Stage } from './Stage.js';

class Game {
  constructor() {
    this.loop;
    this.stage;
    this.assets;
  }

  init(canvas) {
    // Initialize core game engine
    this.loop = new Loop();

    // Initialize components
    this.stage = new Stage(canvas);
    this.stage.setFrequency(60);

    // Load public assets with callbacks (onLoad, onProgress, onError)
    this.assets = new AssetLoader(this.onLoad.bind(this));
    this.assets.load({
      models: '../json/models.json',
      textures: '../json/textures.json',
      audio: '../json/audio.json',
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

  onLoad() {
    // Start generic level
    this.stage.load('v2-test-joints', function() {
      // Add game loops
      this.loop.add(this.update.bind(this), 60); // Physics
      this.loop.add(this.render.bind(this), -1); // Render
      this.loop.start();
    }.bind(this));
  }

  
}

export { Game };