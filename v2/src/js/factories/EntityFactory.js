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
  static Tip = Tip;
  static Checkpoint = Checkpoint;
  static Control = Control;
  static Cube = Cube;
  static Direction = Direction;
  static Finish = Finish;
  static Grapple = Grapple;
  static Gravity = Gravity;
  static Light = Light;
  static Player = Player;
  static Reset = Reset;
  static Sphere = Sphere;
  static Resize = Resize;
  static Spike = Spike;
  static Tip = Tip;
  static TriMesh = TriMesh;

  static create(options) {
    // Call function by class name
    if (options.type != null) {
      var className = this.getClassName(options.type);
      var fn = this['create' + className];
      if (fn == null) {
        console.error(`Error: Entity type "${ className }" not found.`);
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

  static getClassName(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  static getProperty(type, property) {
    const className = this.getClassName(type);
    if (className) {
      const staticClass = this[className];
      if (staticClass) return staticClass[property];
      else {
        console.error(`Error: Static class "${ className }" does not exist.`)
      }
    }
    return;
  }
}

export { EntityFactory }