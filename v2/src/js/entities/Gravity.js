import { Euler, Quaternion, Vector3 } from 'three';
import { Cube } from './Cube.js';

/*
  A Gravity is a subclass that extends the Cube class
*/

class Gravity extends Cube {
  constructor(options) {
    // Set options with default values
    options = Object.assign({
      events: [{ name: 'setGravity' }],
      isSensor: true,
      model: { name: 'cube-gravity' }
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
    var gravity = new Vector3().copy(game.stage.physics.world.gravity);
    var magnitude = gravity.length();
    var quaternion = new Quaternion().copy(this.rigidBody.rotation());
    var euler = new Euler().setFromQuaternion(quaternion);
    var angle = -((Math.PI / 2) - euler.z);

    // Update gravity using entity angle
    game.stage.physics.world.gravity.x = magnitude * Math.cos(angle);
    game.stage.physics.world.gravity.y = magnitude * Math.sin(angle);

    // Dispatch event to pair
    e.pair.dispatchEvent({ type: 'setgravity', gravity: gravity, angle: angle });
  }
}

export { Gravity };