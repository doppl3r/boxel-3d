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
  static Bounce = Bounce;
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
    // Call function by className value
    if (options.className != null) {
      var fn = this['create' + options.className];
      if (fn == null) {
        console.error(`Error: Entity type "${ options.className }" not found.`);
        return;
      }
      return fn(options);
    }
    else {
      console.error(`Error: Entity property "className" is undefined.`)
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

  static getClassNameByType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  static getPropertyByType(name, type) {
    const className = this.getClassNameByType(type);
    return this.getPropertyByClassName(name, className);
  }

  static getPropertyByClassName(name, className) {
    const property = this[className];
    if (property) return property[name];
    return;
  }
}

export { EntityFactory }