import { Bodies, Body } from 'matter-js';
import { Cube } from './Cube.js';

class Spike extends Cube {
  constructor(options = {}) {
    super(options);
    this.body.class = 'spike';

    // Add spike sensor
    var position = { x: 0, y: 0.6 };
    var scale = { x: options.scaleX * 0.6, y: options.scaleY * 0.2 };
    this.sensor = Bodies.rectangle(position.x, -position.y, scale.x, scale.y, { isSensor: true, density: 0, class: 'sensor' });
    Body.setParts(this.body, [this.hitbox, this.sensor]);
    
    // Update debug helper
    this.addHelper(this.sensor, { position: position, color: '#ff0000' });

    // Set properties
    this.setScale({ x: 16, y: 16, z: 16 });
    this.shapes.removeAllShapes();
    this.addShapes(options);
    this.setColors(options.color);
  }

  addShapes(options) {
    var u = (options.scaleZ * 0.25); // unit size
    this.shapes.addCone({ x: -(u * 1), y: (u * 0), z: (u * 1), scaleX: (u * 2), scaleY: (u * 4) });
    this.shapes.addCone({ x: -(u * 1), y: (u * 0), z: -(u * 1), scaleX: (u * 2), scaleY: (u * 4) });
    this.shapes.addCone({ x: (u * 1), y: (u * 0), z: (u * 1), scaleX: (u * 2), scaleY: (u * 4) });
    this.shapes.addCone({ x: (u * 1), y: (u * 0), z: -(u * 1), scaleX: (u * 2), scaleY: (u * 4) });
  }
}

export { Spike };