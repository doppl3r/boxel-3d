import { Cube } from './Cube.js';

/*
  A Checkpoint is a subclass that extends the Cube class
*/

class Checkpoint extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { console.log('Checkpoint selected!'); },
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
}

export { Checkpoint };