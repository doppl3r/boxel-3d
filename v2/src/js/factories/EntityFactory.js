import { Bounce } from '../entities/Bounce';
import { Checkpoint } from '../entities/Checkpoint';
import { Control } from '../entities/Control';
import { Cube } from '../entities/Cube';
import { Direction } from '../entities/Direction';
import { Finish } from '../entities/Finish';
import { Grapple } from '../entities/Grapple';
import { Gravity } from '../entities/Gravity';
import { Light } from '../entities/Light';
import { Player } from '../entities/Player';
import { Reset } from '../entities/Reset';
import { Resize } from '../entities/Resize';
import { Sphere } from '../entities/Sphere';
import { Spike } from '../entities/Spike';
import { Tip } from '../entities/Tip';
import { TriMesh } from '../entities/TriMesh';

/*
  This class creates new entity instances that are compatible
  with Three.js and Rapier.js
*/

class EntityFactory {
  constructor() {
    
  }

  static create(options) {
    // Call function by class name
    if (options.type != null) {
      var type = options.type.charAt(0).toUpperCase() + options.type.slice(1);
      var fn = this['create' + type];
      if (fn == null) {
        console.error(`Error: Entity type "${ type }" not found.`);
        return;
      }
      return fn(options);
    }
    else {
      console.error(`Error: Entity type is undefined.`)
    }
  }
  
  static createBounce(options) {
    return new Bounce(options);
  }

  static createCheckpoint(options) {
    return new Checkpoint(options);
  }

  static createControl(options) {
    return new Control(options);
  }

  static createCube(options) {
    return new Cube(options);
  }

  static createDirection(options) {
    return new Direction(options);
  }

  static createFinish(options) {
    return new Finish(options);
  }

  static createGrapple(options) {
    return new Grapple(options);
  }

  static createGravity(options) {
    return new Gravity(options);
  }

  static createLight(options) {
    return new Light(options);
  }

  static createPlayer(options) {
    return new Player(options);
  }

  static createReset(options) {
    return new Reset(options);
  }

  static createResize(options) {
    return new Resize(options);
  }

  static createSphere(options) {
    return new Sphere(options);
  }

  static createSpike(options) {
    return new Spike(options);
  }

  static createTip(options) {
    return new Tip(options);
  }

  static createTrimesh(options) {
    if (options.model == null) {
      console.warn('Warning: Missing model for TriMesh entity.')
      return;
    }
    return new TriMesh(options);
  }
}

export { EntityFactory }