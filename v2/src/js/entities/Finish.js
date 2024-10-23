import { Cube } from './Cube.js';

/*
  A Finish is a subclass that extends the Cube class
*/

class Finish extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { console.log('Finish selected!'); },
      collisionEventEnd: function(e) {},
      model: 'cube-finish'
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'finish';
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

export { Finish };