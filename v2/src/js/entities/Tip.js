import { Cube } from './Cube.js';

/*
  A Tip is a subclass that extends the Cube class
*/

class Tip extends Cube {
  // Define static properties
  static model = 'cube-tip';

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      events: [{ name: 'showTip', text: 'Say something nice!' }],
      isSensor: true
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

  showTip(e) {

  }
}

export { Tip };