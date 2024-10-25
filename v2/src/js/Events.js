import { Euler, Quaternion } from 'three';

/*
  An event library contains custom functions that can be assign to all entities.
*/

class Events {
  constructor() {
    
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

export { Events };