import { Euler, Quaternion, Vector3 } from 'three';
import { Cube } from './Cube.js';

/*
  A Gravity is a subclass that extends the Cube class
*/

class Gravity extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { e.target.setGravity(e);  },
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

  setGravity(e) {
    var quaternion = new Quaternion().copy(e.target.rigidBody.rotation());
    var rotation = new Euler().setFromQuaternion(quaternion);
    var gravity = new Vector3().copy(game.physics.world.gravity);

    // TODO: Fix gravity not rotating correctly
    gravity.applyAxisAngle({ x: 0, y: 0, z: 1 }, rotation.z);
    
    // Update world gravity
    game.physics.world.gravity.x = gravity.x;
    game.physics.world.gravity.y = gravity.y;
  }
}

export { Gravity };