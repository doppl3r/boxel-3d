import { Cube } from './Cube.js';

/*
  A Control is a subclass that extends the Cube class
*/

class Control extends Cube {
  // Define static properties
  static model = {
    name: 'cube-control'
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      enabledRotations: { x: false, y: false, z: true },
      enabledTranslations: { x: true, y: true, z: false },
      events: [{ name: 'setMode' }],
      isSensor: true,
      status: 1
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'control';
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
    // Safely dispatch event to listener (ex: Player)
    e.pair.dispatchEvent({ type: 'setmode', mode: 'control' })
  }
}

export { Control };