import { Cube } from './Cube.js';

/*
  A Grapple is a subclass that extends the Cube class
*/

class Grapple extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { console.log('Grapple selected!'); },
      collisionEventEnd: function(e) {},
      model: 'cube-grapple'
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'grapple';
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);
  }

  animate(delta, alpha) {
    // Call Entity animate function
    super.animate(delta, alpha);
  }
}

export { Grapple };