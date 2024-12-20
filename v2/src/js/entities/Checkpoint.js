import { Cube } from '../core/entities/Cube.js';

/*
  A Checkpoint is a subclass that extends the Cube class
*/

class Checkpoint extends Cube {
  // Define static properties
  static model = {
    name: 'cube-checkpoint'
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      enabledRotations: { x: false, y: false, z: true },
      enabledTranslations: { x: true, y: true, z: false },
      events: [{ name: 'setCheckpoint' }],
      isSensor: true,
      status: 1
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'checkpoint';
  }

  setCheckpoint({ pair }) {
    console.log(pair)
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

export { Checkpoint };