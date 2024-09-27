import { Vector3 } from 'three';
import { Cube } from './Cube.js';

/*
  A Resize is a subclass that extends the Cube class
*/

class Resize extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { e.target.setScale(e); },
      collisionEventEnd: function(e) {},
      isSensor: true
    }, options);

    // Inherit Character class
    super(options);
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);
  }

  render(delta, alpha) {
    // Call Entity render function
    super.render(delta, alpha);
  }

  setScale(e) {
    var collider = e.target.colliders.entries().next().value[1]; // First collider
    var scale = new Vector3().copy(collider.halfExtents()).multiplyScalar(2);
    e.pair.setScale(scale)
  }
}

export { Resize };