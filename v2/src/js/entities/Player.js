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
      ccd: true,
      jumpForce: 200,
      moveForce: 5
    }, options);

    // Inherit Character class
    super(options);

    // Set default properties
    this.keys = {};
    this.pointer = {}
    this.jumping = false;
    this.jumpForce = options.jumpForce;
    this.moveForce = options.moveForce;
    this.force = new Vector3();

    // Set character camera properties
    this.camera = CameraFactory.create('perspective');
    this.cameraOffset = new Vector3(0, 0, 20);

    // Add event listeners
    this.addEventListener('added', function(e) { this.addEventListeners(); }.bind(this));
    this.addEventListener('removed', function(e) { this.removeEventListeners(); }.bind(this));
    this.addEventListener('collision', this.checkCollision.bind(this))
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

  checkCollision(e) {
    var entity = e.pair[1] == this ? e.pair[0] : e.pair[1];
    if (e.started == true) {
      console.log(entity);
      this.jumping = false;
    }
  }

  updateVelocityFromInput(delta) {
    // Reset force to zero
    this.force.set(0, 0, 0);

    // Add force relative to zero radians/degrees (visually 90° counterclockwise)
    if ((this.keys['Space'] == true || this.pointer[1] == true) && this.isJumping() == false) {
      this.jumping = true;
      this.force.y += delta * this.jumpForce * 1.5;
    }

    // Add new force to current velocity
    this.body.applyImpulse(this.force, true);
  }

  isJumping() {
    return this.jumping;
  }

  addEventListeners(domElement = window.document) {
    // Add event listeners
    domElement.addEventListener('keydown', function(e) { this.keyDown(e); }.bind(this), false);
    domElement.addEventListener('keyup', function(e) { this.keyUp(e); }.bind(this), false);
    domElement.addEventListener('pointerdown', function(e) { this.pointerDown(e); }.bind(this), false);
    domElement.addEventListener('pointerup', function(e) { this.pointerUp(e); }.bind(this), false);
  }
  
  removeEventListeners(domElement = window.document) {
    // Add event listeners
    domElement.removeEventListener('keydown', function(e) { this.keyDown(e); }.bind(this), false);
    domElement.removeEventListener('keyup', function(e) { this.keyUp(e); }.bind(this), false);
    domElement.removeEventListener('pointerdown', function(e) { this.pointerDown(e); }.bind(this), false);
    domElement.removeEventListener('pointerup', function(e) { this.pointerUp(e); }.bind(this), false);
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

  pointerDown(e) {
    this.pointer[e.which] = true;
  }
  
  pointerUp(e) {
    this.pointer[e.which] = false;
  }
}

export { Player };