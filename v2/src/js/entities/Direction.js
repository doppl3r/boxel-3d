import { Cube } from './Cube.js';

/*
  A Direction is a subclass that extends the Cube class
*/

class Direction extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { console.log('Direction selected!'); },
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
}

export { Direction };