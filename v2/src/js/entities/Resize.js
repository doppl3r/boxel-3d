import { Vector3 } from 'three';
import { Cube } from '../core/entities/Cube.js';

/*
  A Resize is a subclass that extends the Cube class
*/

class Resize extends Cube {
  // Define static properties
  static model = {
    name: 'cube-resize'
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      enabledRotations: { x: false, y: false, z: true },
      enabledTranslations: { x: true, y: true, z: false },
      events: [{ name: 'setPairScale' }],
      isSensor: true,
      status: 1
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'resize';
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);
  }

  animate(delta, alpha) {
    // Call Entity animate function
    super.animate(delta, alpha);
  }

  setPairScale(e) {
    var collider = e.target.rigidBody.collider(0); // First collider
    var scale = new Vector3().copy(collider.halfExtents()).multiplyScalar(2);
    e.pair.setScale(scale)
  }
}

export { Resize };