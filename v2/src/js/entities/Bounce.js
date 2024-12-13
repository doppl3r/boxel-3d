import { Cube } from './Cube.js';
import { Cuboid } from '@dimforge/rapier3d';

/*
  A Bounce is a subclass that extends the Cube class
*/

class Bounce extends Cube {
  // Define static properties
  static model = {
    name: 'cube-bounce'
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      enabledRotations: { x: false, y: false, z: true },
      enabledTranslations: { x: true, y: true, z: false },
      scale: { x: 1, y: 1, z: 1 },
      status: 1
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'bounce';

    // Add a sensor collider to the rigidBody
    this.addColliderDesc({
      activeCollisionTypes: 'ALL',
      activeEvents: 'COLLISION_EVENTS',
      events: [{ name: 'bounce' }],
      isSensor: true,
      mass: 0,
      shape: new Cuboid(options.scale.x * 0.4, options.scale.y * 0.125, options.scale.z * 0.4),
      translation: { x: 0, y: 0.5 * options.scale.y, z: 0 }
    });
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);
  }

  animate(delta, alpha) {
    // Call Entity animate function
    super.animate(delta, alpha);
  }
}

export { Bounce };