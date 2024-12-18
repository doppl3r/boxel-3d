import { Cube as CubeCore } from '../core/entities/Cube.js';

class Cube extends CubeCore {
  // Define static properties
  static model = {
    name: ''
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      color: '#0290ff'
    }, options);

    // Inherit CubeCore class
    super(options);
  }

  update(delta) {
    super.update(delta);
  }

  animate(delta, alpha) {
    super.animate(delta, alpha);
  }
}

export { Cube };