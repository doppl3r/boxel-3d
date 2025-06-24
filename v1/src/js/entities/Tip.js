import { Cube } from './Cube.js';
import { Text } from '../Text.js';

class Tip extends Cube {
  constructor(options = {}) {
    super(options);
    this.body.class = 'tip';
    this.text = 'Do not touch the spikes!';
    this.text2D = new Text({ text: this.text, class: 'CSS2DObject tip' });
    //this.add(this.text2D);
    
    // Update hitbox behavior
    this.hitbox.isSensor = true;
    this.hitbox.class = 'sensor';
    
    // Update body properties
    this.setScale({ x: 16, y: 16, z: 16 });
    this.shapes.removeAllShapes();
    this.shapes.setOpacities(0.5);
    this.addShapes(options);
  }

  addShapes(options) {
    var u = (options.scaleZ * 0.2); // unit size
    this.shapes.addCube({ color: '#0287ef', z: -(u * 0.5), scaleZ: (u * 4) });
    this.shapes.addCube({ y: (u * 1), z: (u * 2), scaleX: u, scaleY: (u * 2), scaleZ: u, color: '#fff' });
    this.shapes.addCube({ y: -(u * 1.5), z: (u * 2), scaleX: u, scaleY: u, scaleZ: u, color: '#fff' });
  }

  setText(text) {
    if (text) {
      this.text = text;
      this.text2D.setText(text);
    }
  }

  setColors() {
    // Prevent setting colors
  }
}

export { Tip };