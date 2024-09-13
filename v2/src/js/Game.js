import { Loop } from './Loop';
import { Graphics } from './Graphics.js';
import { AssetLoader } from './loaders/AssetLoader.js';
import { Physics } from './Physics.js';
import { Level } from './Level.js';

class Game {
  constructor() {

  }

  init(canvas) {
    // Initialize core game engine
    this.loop = new Loop();
    this.graphics = new Graphics(canvas);

    // Initialize components
    this.physics = new Physics();

    // Initialize level
    this.level = new Level();

    // Load public assets with callbacks (onLoad, onProgress, onError)
    this.assets = new AssetLoader(this.onLoad.bind(this), this.onProgress.bind(this));
    this.assets.load('../json/');
  }

  update(data = { delta: 1 / 60 }) {
    // Update world physics
    this.physics.update(data.delta);
  }

  render(data = { delta: 1 / 60, alpha: 0 }) {
    this.physics.render(data.delta, data.alpha);

    // Render graphics
    this.graphics.render();
  }

  async onLoad() {
    // Initialize entity manager
    this.physics.init();
    this.physics.setFrequency(60);

    // Adjust graphics components
    this.graphics.scene.add(this.physics.debugger);
    this.graphics.scene.add(this.level);

    // Start generic level
    this.loadLevel('Campaign Level 1');

    // Add game loops
    this.loop.add(this.update.bind(this), 60); // Physics
    this.loop.add(this.render.bind(this), -1); // Render
    this.loop.start();
  }

  loadLevel(name = 'Campaign Level 1', callback = function(){}) {
    // Load level from JSON
    this.physics.clear();
    this.level.load('../json/' + name + '.json', function(entities) {
      entities.forEach(function(entity) {
        this.physics.add(entity);
        if (entity == this.level.player) {
          this.graphics.setCamera(entity.camera);
        }
        callback();
      }.bind(this));
    }.bind(this));
  }

  onProgress(url, itemsLoaded, itemsTotal) {
    // Emit loader progress to global window object
    var percent = Math.ceil((itemsLoaded / itemsTotal) * 100);
    dispatchEvent(new CustomEvent('updateLoading', { detail: { url: url, itemsLoaded: itemsLoaded, itemsTotal: itemsTotal, percent: percent }}));
  }
}

export { Game };