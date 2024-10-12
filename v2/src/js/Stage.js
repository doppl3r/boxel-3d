import { Graphics } from './Graphics.js';
import { Physics } from './Physics.js';
import { LevelFactory } from './factories/LevelFactory.js';

/*
  Manage physics related components
*/

class Stage {
  constructor(canvas) {
    // Initialize Rapier world
    this.physics = new Physics();

    // Add 3D pipeline to stage
    this.graphics = new Graphics(canvas);
    this.graphics.scene.add(this.physics.debugger);
    this.graphics.addStats();
  }

  update(delta) {
    // Update physics component
    this.physics.update(delta);
  }

  render(delta, alpha) {
    // Update all entities animation properties
    this.physics.animate(delta, alpha);

    // Render graphics
    this.graphics.render();
  }

  async loadLevel(path) {
    this.physics.clear();
    
    // Load level from JSON
    var entities = await LevelFactory.loadFile(path);

    // Loop through entities
    entities.forEach(function(entity) {
      this.physics.add(entity);
      this.graphics.scene.add(entity.object);
      if (entity.type == 'player') {
        this.player = entity;
        this.graphics.setCamera(entity.camera);
      }
    }.bind(this));
  }
}

export { Stage };