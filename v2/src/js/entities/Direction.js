import { Euler, Quaternion, Vector3 } from 'three';
import { Cube } from './Cube.js';

/*
  A Direction is a subclass that extends the Cube class
*/

class Direction extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { e.target.setDirection(e); },
      collisionEventEnd: function(e) {}
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

  setDirection(e) {
    var force = new Vector3(1, 0, 0); // Default "right"
    var speed = 0.5;
    var max = 14;
    var quaternion = new Quaternion().copy(e.target.rigidBody.rotation());
    var euler = new Euler().setFromQuaternion(quaternion);
    var angle = euler.z;
    
    // Update force using target entity angle
    force.x = Math.cos(angle);
    force.y = Math.sin(angle);

    // TODO: Clamp velocity
    e.pair.setForce(force, speed, max);
  }
}

export { Direction };