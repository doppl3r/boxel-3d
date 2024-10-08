import { Cube } from './Cube.js';
import { Cuboid } from '@dimforge/rapier3d';

/*
  A Spike is a subclass that extends the Cube class
*/

class Spike extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'spike';

    // Add a sensor collider to the rigidBody
    this.addColliderDesc({
      collisionEventStart: function(e) { e.target.kill(e); },
      isSensor: true,
      mass: 0,
      shape: new Cuboid(options.scale.x * 0.4, options.scale.y * 0.125, options.scale.z * 0.25),
      translation: { x: 0, y: 0.5 * options.scale.y, z: 0 }
    });
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);
  }

  render(delta, alpha) {
    // Call Entity render function
    super.render(delta, alpha);
  }

  kill(e) {
    console.log('Spike Sensor Touched!');
  }
}

export { Spike };