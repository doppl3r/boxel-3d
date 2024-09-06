import { Bounce } from '../entities/Bounce';
import { Checkpoint } from '../entities/Checkpoint';
import { Cube } from '../entities/Cube';
import { Finish } from '../entities/Finish';
import { Player } from '../entities/Player';
import { Resize } from '../entities/Resize';
import { Spike } from '../entities/Spike';
import { Tip } from '../entities/Tip';

/*
  This class creates new entity instances that are compatible
  with Three.js and Rapier.js
*/

class EntityFactory {
  constructor() {
    
  }

  static create(options) {
    // Call function by class name
    var fn = this['create' + options.class].bind(this);
    if (fn == null) return;
    return fn(options);
  }
  
  static createBounce(options) {
    return new Bounce(options);
  }

  static createCheckpoint(options) {
    return new Checkpoint(options);
  }

  static createCube(options) {
    return new Cube(options);
  }

  static createFinish(options) {
    return new Finish(options);
  }

  static createPlayer(options) {
    return new Player(options);
  }

  static createResize(options) {
    return new Resize(options);
  }

  static createSpike(options) {
    return new Spike(options);
  }

  static createTip(options) {
    return new Tip(options);
  }
}

export { EntityFactory }