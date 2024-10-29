import { Cube } from './Cube.js';

/*
  A Grapple is a subclass that extends the Cube class
*/

class Grapple extends Cube {
  // Define static properties
  static model = 'cube-grapple';

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      events: [{ name: 'setMode' }]
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

  setMode(e) {

  }
}

export { Grapple };