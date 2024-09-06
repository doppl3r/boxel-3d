import { Vector3 } from 'three';
import { CameraFactory } from '../factories/CameraFactory.js';
import { Cube } from './Cube.js';

/*
  A Player is a subclass that extends the Cube class
*/

class Player extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      activeCollisionTypes: 'ALL',
      activeEvents: 'COLLISION_EVENTS',
      moveForce: 5,
      jumpForce: 5
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.keys = {};
    this.jumping = true;
    this.jumpForce = options.jumpForce;
    this.moveForce = options.moveForce;
    this.force = new Vector3();

    // Set character camera properties
    this.camera = CameraFactory.create('perspective');
    this.cameraOffset = new Vector3(0, 0, 20);
  }

  update(delta) {
    // Update the player velocity from input keys
    this.updateVelocityFromInput(delta);

    // Call Entity update function
    super.update(delta);
  }

  render(delta, alpha) {
    // Call Entity render function
    super.render(delta, alpha);

    // Update camera position
    this.camera.position.copy(this.object.position).add(this.cameraOffset);
    this.camera.lookAt(this.object.position);
  }

  updateVelocityFromInput(delta) {
    // Reset force to zero
    this.force.set(0, 0, 0);

    // Add force relative to zero radians/degrees (visually 90° counterclockwise)
    if (this.keys['KeyW'] == true) this.force.x = -delta * this.moveForce;
    if (this.keys['KeyA'] == true) this.force.z = delta * this.moveForce;
    if (this.keys['KeyS'] == true) this.force.x = delta * this.moveForce;
    if (this.keys['KeyD'] == true) this.force.z = -delta * this.moveForce;
    if (this.keys['Space'] == true && this.isJumping() == false) {
      this.jumping = true;
      this.force.y += delta * this.jumpForce * 1.5;
    }

    // TODO: Add new force to current velocity
  }

  isJumping() {
    return this.jumping;
  }

  addEventListeners(domElement = window.document) {
    // Add event listeners
    domElement.addEventListener('keydown', function(e) { this.keyDown(e); }.bind(this), false);
    domElement.addEventListener('keyup', function(e) { this.keyUp(e); }.bind(this), false);
  }

  removeEventListeners(domElement = window.document) {
    // Add event listeners
    domElement.removeEventListener('keydown', function(e) { this.keyDown(e); }.bind(this), false);
    domElement.removeEventListener('keyup', function(e) { this.keyUp(e); }.bind(this), false);
  }

  keyDown(e) {
    // Assign key inputs to true (once)
    if (e.repeat) return;
    this.keys[e.code] = true;
  }

  keyUp(e) {
    // Set key values to false
    this.keys[e.code] = false;
  }
}

export { Player };