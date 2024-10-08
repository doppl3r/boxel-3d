import { Cube } from './Cube.js';

/*
  A Reset is a subclass that extends the Cube class
*/

class Reset extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { console.log('Reset selected!'); },
      collisionEventEnd: function(e) {},
      isSensor: true
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

  render(delta, alpha) {
    // Call Entity render function
    super.render(delta, alpha);
  }
}

export { Reset };