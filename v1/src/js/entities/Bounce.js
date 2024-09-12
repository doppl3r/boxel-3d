import { Bodies, Body } from 'matter-js';
import { Cube } from './Cube.js';

class Bounce extends Cube {
  constructor(options = {}) {
    super(options);
    this.body.class = 'bounce';

    // Add bounce sensor
    var position = { x: 0, y: 0.6 };
    var scale = { x: options.scaleX * 0.6, y: options.scaleY * 0.2 };
    this.sensor = Bodies.rectangle(position.x, -position.y, scale.x, scale.y, { isSensor: true, density: 0, class: 'sensor' });
    Body.setParts(this.body, [this.hitbox, this.sensor]);

    // Update debug helper
    this.addHelper(this.sensor, { position: position, color: '#ffff00' });

    // Set properties
    this.setScale({ x: 16, y: 16, z: 16 });
    this.shapes.removeAllShapes();
    this.addShapes(options);
  }

  addShapes(options) {
    var u = (options.scaleZ * 0.2); // unit size
    this.shapes.addCube({ y: (u * 2), scaleX: (u * 5), scaleY: (u * 1), scaleZ: (u * 5), color: '#0287ef' });
    this.shapes.addCube({ y: (u * 1), scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 1), color: '#ffffff' });
    this.shapes.addCube({ y: -(u * 1), scaleY: (u * 3), scaleZ: (u * 5), color: '#0287ef' });
  }
}

export { Bounce };