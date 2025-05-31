import { Cube } from './Cube.js';
import { Player } from './Player.js';
import { Tip } from './Tip.js';
import { Bounce } from './Bounce.js';
import { Checkpoint } from './Checkpoint.js';
import { Spike } from './Spike.js';
import { Shrink } from './Shrink.js';
import { Grow } from './Grow.js';
import { Resize } from './Resize.js';
import { Direction } from './Direction.js';
import { Gravity } from './Gravity.js';
import { Grapple } from './Grapple.js';
import { Finish } from './Finish.js';
import { Reset } from './Reset.js';
import { Control } from './Control.js';
import { Power } from './Power.js';

class EntityFactory {
  constructor() {
    this.color = '#620460';
  }

  createObject(type, options) {
    var object;

    // Define default options
    if (options == null) {
      options = {
        color: this.color
      };
    }

    // Create new object from type
    switch(type) {
      case('player'): object = new Player(options); break;
      case('tip'): object = new Tip(options); break;
      case('bounce'): object = new Bounce(options); break;
      case('checkpoint'): object = new Checkpoint(options); break;
      case('spike'): object = new Spike(options); break;
      case('shrink'): object = new Shrink(options); break;
      case('grow'): object = new Grow(options); break;
      case('resize'): object = new Resize(options); break;
      case('direction'): object = new Direction(options); break;
      case('gravity'): object = new Gravity(options); break;
      case('grapple'): object = new Grapple(options); break;
      case('finish'): object = new Finish(options); break;
      case('reset'): object = new Reset(options); break;
      case('control'):
        options.model = app.assets.models.clone('cube-control');
        object = new Control(options);
      break;
      case('power'):
        options.model = app.assets.models.clone('cube-power');
        object = new Power(options);
      break;
      default: object = new Cube(options);
    }
    return object;
  }
}

export { EntityFactory }