import { Vector3 } from 'three';
import { CameraFactory } from '../factories/CameraFactory.js';
import { Cube } from './Cube.js';
import { LightFactory } from '../factories/LightFactory.js';

/*
  A Player is a subclass that extends the Cube class
*/

class Player extends Cube {
  constructor(options = {}) {
    // Set options with default values
    options = Object.assign({
      activeCollisionTypes: 'ALL',
      activeEvents: 'COLLISION_EVENTS',
      collisionEventStart: function(e) { e.target.checkCollision(e); },
      collisionEventEnd: function(e) {},
      jumpForce: 30,
      moveForce: 5
    }, options);

    // Inherit Character class
    super(options);

    // Add light to player
    this.light = LightFactory.create('point', { color: '#dc265a', intensity: Math.PI * 10 });
    this.object.add(this.light);

    // Set default properties
    this.keys = {};
    this.pointer = {}
    this.jumpCount = 0;
    this.jumpForce = options.jumpForce;
    this.moveForce = options.moveForce;
    this.force = new Vector3();
    this.velocity = new Vector3();

    // Set character camera properties
    this.camera = CameraFactory.create('perspective');
    this.cameraOffset = new Vector3(0, 0, 20);

    // Add event listeners
    this.onAdded = this.onAdded.bind(this);
    this.onRemoved = this.onRemoved.bind(this);
    this.addEventListener('added', this.onAdded);
    this.addEventListener('removed', this.onRemoved);
  }

  update(delta) {
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
    if (e.started == true) {
      this.jumpCount = 1;
    }
  }

  jump() {
    if (this.jumpCount > 0) {
      this.jumpCount--;

      // Reset player falling velocity
      this.velocity.copy(this.rigidBody.linvel());
      this.velocity.y = 0;
      this.rigidBody.setLinvel(this.velocity);
      this.rigidBody.applyImpulse({ x: 0, y: this.jumpForce, z: 0 }, true);
    }
  }

  onAdded(event) {
    // Bind "this" to properly remove events
    this.keyDown = this.keyDown.bind(this);
    this.keyUp = this.keyUp.bind(this);
    this.pointerDown = this.pointerDown.bind(this);
    this.pointerUp = this.pointerUp.bind(this);

    // Add event listeners to document
    document.addEventListener('keydown', this.keyDown);
    document.addEventListener('keyup', this.keyUp);
    document.addEventListener('pointerdown', this.pointerDown);
    document.addEventListener('pointerup', this.pointerUp);
  }
  
  onRemoved(event) {
    // Remove entity event listeners
    this.removeEventListener('added', this.onAdded);
    this.removeEventListener('removed', this.onRemoved);
    super.onRemoved(event);

    // Remove event listeners
    document.removeEventListener('keydown', this.keyDown);
    document.removeEventListener('keyup', this.keyUp);
    document.removeEventListener('pointerdown', this.pointerDown);
    document.removeEventListener('pointerup', this.pointerUp);
  }

  keyDown(e) {
    // Assign key inputs to true (once)
    if (e.repeat) return;
    this.keys[e.code] = true;

    // Add keybindings
    if (this.keys['Space'] == true) this.jump();
  }

  keyUp(e) {
    // Set key values to false
    this.keys[e.code] = false;
  }

  pointerDown(e) {
    this.pointer[e.which] = true;

    // Add touch bindings
    if (this.pointer[1] == true) this.jump();
  }
  
  pointerUp(e) {
    this.pointer[e.which] = false;
  }
}

export { Player };