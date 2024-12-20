import { Cube } from '../core/entities/Cube.js';

/*
  A Tip is a subclass that extends the Cube class
*/

class Tip extends Cube {
  // Define static properties
  static model = {
    name: 'cube-tip'
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      enabledRotations: { x: false, y: false, z: true },
      enabledTranslations: { x: true, y: true, z: false },
      events: [{ name: 'showTip', value: 'Say something nice!' }],
      isSensor: true,
      status: 1
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

  showTip({ value }) {
    // Dispatch new modal from event
    window.dispatchEvent(new CustomEvent('openModal', {
      detail: {
        title: 'Tip',
        text: value,
        inputs: [
          {
            type: 'button',
            value: 'Continue',
            callback: function() {
              window.dispatchEvent(new CustomEvent('closeModal'));
            }
          }
        ]
      }
    }));
  }
}

export { Tip };