import { Euler, Quaternion, Vector3 } from 'three';
import { Cube } from './Cube.js';

/*
  A Direction is a subclass that extends the Cube class
*/

class Direction extends Cube {
  // Define static properties
  static model = {
    name: 'cube-direction'
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      events: [{ name: 'setDirection' }]
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'direction';
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);
  }

  animate(delta, alpha) {
    // Call Entity animate function
    super.animate(delta, alpha);
  }

  setDirection(e) {
    var direction = new Vector3(1, 0, 0); // Default "right"
    var quaternion = new Quaternion().copy(e.target.rigidBody.rotation());
    var euler = new Euler().setFromQuaternion(quaternion);
    var angle = euler.z;
    
    // Update direction using target entity angle
    direction.x = Math.cos(angle);
    direction.y = Math.sin(angle);

    // Set force direction
    e.pair.setForce(direction, 0.5, 14);
  }
}

export { Direction };