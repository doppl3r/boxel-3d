import { Cube } from './Cube.js';

/*
  A Grapple is a subclass that extends the Cube class
*/

class Grapple extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { console.log('Grapple selected!'); },
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

export { Grapple };