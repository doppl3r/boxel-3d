import { Cube } from './Cube.js';

/*
  A Finish is a subclass that extends the Cube class
*/

class Finish extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      collisionEventStart: function(e) { console.log('Finish selected!'); },
      collisionEventEnd: function(e) {}
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

  render(delta, alpha) {
    // Call Entity render function
    super.render(delta, alpha);
  }
}

export { Finish };