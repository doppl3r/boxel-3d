import { Euler, Quaternion, Vector3 } from 'three';
import { Cube } from './Cube.js';

/*
  A Gravity is a subclass that extends the Cube class
*/

class Gravity extends Cube {
  // Define static properties
  static model = {
    name: 'cube-gravity'
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      enabledRotations: { x: false, y: false, z: true },
      enabledTranslations: { x: true, y: true, z: false },
      events: [{ name: 'setGravity' }],
      isSensor: true,
      status: 1
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

  animate(delta, alpha) {
    // Call Entity animate function
    super.animate(delta, alpha);
  }

  setGravity(e) {
    var gravity = new Vector3().copy(game.physics.world.gravity);
    var magnitude = gravity.length();
    var quaternion = new Quaternion().copy(e.target.rigidBody.rotation());
    var euler = new Euler().setFromQuaternion(quaternion);
    var angle = -((Math.PI / 2) - euler.z);

    // Update gravity using entity angle
    game.physics.world.gravity.x = magnitude * Math.cos(angle);
    game.physics.world.gravity.y = magnitude * Math.sin(angle);

    // Dispatch event to pair
    e.pair.dispatchEvent({ type: 'setgravity', gravity: gravity, angle: angle });
  }
}

export { Gravity };