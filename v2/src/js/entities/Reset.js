import { Cube } from './Cube.js';

/*
  A Reset is a subclass that extends the Cube class
*/

class Reset extends Cube {
  // Define static properties
  static model = {
    name: 'cube-reset'
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      enabledRotations: { x: false, y: false, z: true },
      enabledTranslations: { x: true, y: true, z: false },
      events: [{ name: 'reset' }],
      isSensor: true,
      status: 1
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'reset';
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);
  }

  animate(delta, alpha) {
    // Call Entity animate function
    super.animate(delta, alpha);
  }

  reset(e) {

  }
}

export { Reset };