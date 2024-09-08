import { Cube } from './Cube.js';

/*
  A Gravity is a subclass that extends the Cube class
*/

class Gravity extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      isSensor: true,
      type: 'Fixed'
    }, options);

    // Inherit Character class
    super(options);

    // Add event listeners
    this.addEventListener('collision', this.checkCollision.bind(this))
  }

  checkCollision(e) {
    if (e.started == true) {
      console.log('Gravity selected!');
    }
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

export { Gravity };