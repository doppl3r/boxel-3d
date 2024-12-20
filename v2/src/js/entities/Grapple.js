import { Cube } from '../core/entities/Cube.js';

/*
  A Grapple is a subclass that extends the Cube class
*/

class Grapple extends Cube {
  // Define static properties
  static model = {
    name: 'cube-grapple'
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      enabledRotations: { x: false, y: false, z: true },
      enabledTranslations: { x: true, y: true, z: false },
      events: [{ name: 'setMode' }],
      status: 1
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

  setMode({ pair }) {
    // Safely dispatch event to listener (ex: Player)
    pair.dispatchEvent({ type: 'setmode', value: 'grapple' })
  }
}

export { Grapple };