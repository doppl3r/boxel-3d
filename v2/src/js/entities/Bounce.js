import { Euler, Quaternion } from 'three';
import { Cube } from './Cube.js';
import { Cuboid } from '@dimforge/rapier3d';

/*
  A Bounce is a subclass that extends the Cube class
*/

class Bounce extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.type = 'bounce';

    // Add a sensor collider to the rigidBody
    this.addColliderDesc({
      activeCollisionTypes: 'ALL',
      activeEvents: 'COLLISION_EVENTS',
      collisionEventStart: function(e) { e.target.bounce(e); },
      isSensor: true,
      mass: 0,
      shape: new Cuboid(options.scale.x * 0.4, options.scale.y * 0.125, options.scale.z * 0.4),
      translation: { x: 0, y: 0.5 * options.scale.y, z: 0 }
    });
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);
  }

  animate(delta, alpha) {
    // Call Entity animate function
    super.animate(delta, alpha);
  }

  bounce(e) {
    const magnitude = 30;
    const quaternion = new Quaternion().copy(e.target.rigidBody.rotation());
    const euler = new Euler().setFromQuaternion(quaternion);
    const angle = euler.z;
    
    // Update Bounce entity
    e.target.applyVelocityAtAngle({ x: 1, y: 0, z: 1 }, angle); // Cancel y-velocity
    e.target.applyImpulseAtAngle({ x: 0, y: -magnitude * e.target.object.scale.y, z: 0 }, angle); // Bounce
    
    // Update collision pair
    e.pair.applyVelocityAtAngle({ x: 1, y: 0, z: 1 }, angle); // Cancel y-velocity
    e.pair.applyImpulseAtAngle({ x: 0, y: magnitude * e.pair.rigidBody.mass(), z: 0 }, angle); // Bounce
  }
}

export { Bounce };