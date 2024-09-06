import { Cube } from '../entities/Cube';
import { Finish } from '../entities/Finish';
import { Player } from '../entities/Player';
import { Spike } from '../entities/Spike';

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
  
  static createCube(options) {
    return new Cube(options);
  }

  static createFinish(options) {
    return new Finish(options);
  }

  static createPlayer(options) {
    return new Player(options);
  }

  static createSpike(options) {
    return new Spike(options);
  }
}

export { EntityFactory }