import { LightFactory } from '../factories/LightFactory.js';
import { Cube } from './Cube.js';

/*
  A Light is a subclass that extends the Cube class
*/

class Light extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) {},
      collisionEventEnd: function(e) {},
      isSensor: true,
      status: 1
    }, options);

    // Initialize default cube model mesh
    if (options.model == null) {
      options.model = LightFactory.create('point');
    }

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'light';
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);
  }

  render(delta, alpha) {
    // Call Entity render function
    super.render(delta, alpha);
  }
}

export { Light };