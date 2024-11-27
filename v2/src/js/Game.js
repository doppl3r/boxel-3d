import { Loop } from './core/Loop';
import { AssetLoader } from './loaders/AssetLoader.js';
import { Graphics } from './core/Graphics.js';
import { Physics } from './core/Physics.js';
import { LevelFactory } from './factories/LevelFactory.js';

class Game {
  constructor(onLoad) {
    this.loop = new Loop();
    this.physics = new Physics();
    this.graphics;
    this.assets = new AssetLoader(this.onLoad.bind(this, onLoad));
  }

  init(canvas) {
    // Initialize components
    this.graphics = new Graphics(canvas);
    this.graphics.scene.add(this.physics.debugger);

    // Load public assets with callbacks (onLoad, onProgress, onError)
    this.assets.load({
      models: '../json/assets-models.json',
      textures: '../json/assets-textures.json',
      audio: '../json/assets-audio.json'
    });
  }

  update(data = { delta: 1 / 60 }) {
    // Update entity physics
    this.physics.update(data.delta);
  }

  render(data = { delta: 1 / 60, alpha: 0 }) {
    // Update all entities animation properties
    this.physics.animate(data.delta, data.alpha);

    // Render graphics
    this.graphics.render();
  }

  onLoad(onLoad) {
    // Add and start game loops
    this.loop.add(this.update.bind(this), 60); // Physics
    this.loop.add(this.render.bind(this), -1); // Render
    this.loop.start();
  
    // Run optional callback
    if (typeof onLoad == 'function') onLoad();
  }

  async loadLevel(path) {
    this.physics.clear();
    
    // Load level from JSON
    var entities = await LevelFactory.loadFile(path);

    // Loop through entities
    entities.forEach(function(entity) {
      // Add 3D object after entity is added
      entity.addEventListener('added', function(e) {
        this.graphics.scene.add(entity.object);
      }.bind(this));

      // Add entity to physics entities map
      this.physics.add(entity);

      // Assign rendering camera from player
      if (entity.type == 'player') {
        this.player = entity;
        this.graphics.setCamera(entity.camera);
      }
    }.bind(this));

    // Return final array of entities
    return entities;
  }
}

export { Game };