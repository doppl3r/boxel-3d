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

    // Set default properties
    this.type = 'gravity';
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
    var gravity = new Vector3().copy(game.stage.world.gravity);
    var magnitude = gravity.length();
    var quaternion = new Quaternion().copy(this.rigidBody.rotation());
    var euler = new Euler().setFromQuaternion(quaternion);
    var angle = -((Math.PI / 2) - euler.z);

    // Update gravity using entity angle
    game.stage.world.gravity.x = magnitude * Math.cos(angle);
    game.stage.world.gravity.y = magnitude * Math.sin(angle);

    // Dispatch event to pair
    e.pair.dispatchEvent({ type: 'setgravity', gravity: gravity, angle: angle });
  }
}

export { Gravity };