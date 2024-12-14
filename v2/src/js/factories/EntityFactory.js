import { EntityFactory as EntityFactoryCore } from '../core/factories/EntityFactory.js';
import { Bounce } from '../entities/Bounce';
import { Checkpoint } from '../entities/Checkpoint';
import { Control } from '../entities/Control';
import { Direction } from '../entities/Direction';
import { Finish } from '../entities/Finish';
import { Grapple } from '../entities/Grapple';
import { Gravity } from '../entities/Gravity';
import { Player } from '../entities/Player';
import { Reset } from '../entities/Reset';
import { Resize } from '../entities/Resize';
import { Spike } from '../entities/Spike';
import { Tip } from '../entities/Tip';

/*
  This class creates new entity instances that are compatible
  with Three.js and Rapier.js
*/

class EntityFactory extends EntityFactoryCore {
  static Bounce = Bounce;
  static Checkpoint = Checkpoint;
  static Control = Control;
  static Direction = Direction;
  static Finish = Finish;
  static Grapple = Grapple;
  static Gravity = Gravity;
  static Player = Player;
  static Reset = Reset;
  static Resize = Resize;
  static Spike = Spike;
  static Tip = Tip;

  static create(options) {
    // Ensure className is defined
    if (options.className == undefined) {
      options.className = EntityFactory.getClassNameByType(options.type);
    }
    
    // Create default model json from entity class static model field
    if (options.model == undefined) {
      options.model = EntityFactory.getPropertyByClassName('model', options.className);
    }

    // Duplicate 3D model from model json
    if (options.model && game.assets.get(options.model.name)) {
      options.model = game.assets.duplicate(options.model.name);
    }

    // Call function by className value
    return super.create(options);
  }
}

export { EntityFactory }