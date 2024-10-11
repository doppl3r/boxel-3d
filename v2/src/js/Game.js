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

    // Load public assets with callbacks (onLoad, onProgress, onError)
    this.assets = new AssetLoader(this.onLoad.bind(this));
    this.assets.load({ models: '../json/assets-models.json', textures: '../json/assets-textures.json', audio: '../json/assets-audio.json' });
  }

  update(data = { delta: 1 / 60 }) {
    // Update entity physics
    this.stage.update(data.delta);
  }

  render(data = { delta: 1 / 60, alpha: 0 }) {
    // Update entity 3D objects
    this.stage.render(data.delta, data.alpha);
  }

  async onLoad() {
    // Load generic level
    await this.stage.loadLevel('../json/v2-test-joints.json');

    // Add game loops
    this.loop.add(this.update.bind(this), 60); // Physics
    this.loop.add(this.render.bind(this), -1); // Render
    this.loop.start();
  }
}

export { Game };