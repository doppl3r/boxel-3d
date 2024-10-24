import { Cube } from './Cube.js';

/*
  A Tip is a subclass that extends the Cube class
*/

class Tip extends Cube {
  constructor(options) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { console.log('Tip selected!'); },
      collisionEventEnd: function(e) {},
      isSensor: true,
      model: { name: 'cube-tip' }
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'tip';
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

export { Tip };