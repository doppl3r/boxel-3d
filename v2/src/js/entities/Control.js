import { Cube } from './Cube.js';

/*
  A Control is a subclass that extends the Cube class
*/

class Control extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { console.log('Control selected!'); },
      collisionEventEnd: function(e) {},
      isSensor: true
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

export { Control };