import { Cube } from './Cube.js';

/*
  A Checkpoint is a subclass that extends the Cube class
*/

class Checkpoint extends Cube {
  constructor(options) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { console.log('Checkpoint selected!'); },
      collisionEventEnd: function(e) {},
      isSensor: true,
      model: { name: 'cube-checkpoint' }
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'checkpoint';
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