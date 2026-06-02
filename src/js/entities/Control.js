import { Bodies, Body } from 'matter-js';
import { Cube } from './Cube.js';

class Control extends Cube {
  constructor(options = {}) {
    super(options);
    this.body.class = 'control';
    
    // Set sensor the same size as rectangle
    this.hitbox.isSensor = true;
    this.sensor = Bodies.rectangle(0, 0, options.scaleX, options.scaleY, { isSensor: true, density: 0, class: 'sensor' });
    Body.setParts(this.body, [this.hitbox, this.sensor]);

    // Update body properties
    this.setScale({ x: 16, y: 16, z: 16 });
    this.shapes.removeAllShapes();
    this.add(options.model);
  }

  setColors() {
    // Prevent setting colors
  }
}

export { Control };