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
      collisionEventEnd: function(e) {}
    }, options);

    // Inherit Cube class
    super(options);

    // Add light to player
    this.light = LightFactory.create('point', { color: '#dc265a', intensity: Math.PI * 10 });
    this.object.add(this.light);

    // Set default properties
    this.keys = {};
    this.pointer = {}
    this.jumpCount = 0;

    // Create camera with offset property
    this.camera = CameraFactory.create('perspective');
    this.cameraOffset = new Vector3(0, 0, 20);

    // Bind "this" context to class function (required for event removal)
    this.onPlayerAdded = this.onPlayerAdded.bind(this);
    this.onPlayerRemoved = this.onPlayerRemoved.bind(this);
    
    // Add event listeners
    this.addEventListener('added', this.onPlayerAdded);
    this.addEventListener('removed', this.onPlayerRemoved);
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
      const magnitude = 30;
      const mass = this.rigidBody.mass();
      const force = new Vector3(0, magnitude * mass, 0);
      const gravity = game.physics.world.gravity;
      const angle = Math.atan2(gravity.y, gravity.x) + (Math.PI / 2);
      
      // Update velocity and apply jump
      this.setAngularVelocityAtAngle({ x: 0, y: 0, z: 8 }, angle); // Set angular velocity
      this.applyVelocityAtAngle({ x: 1, y: 0, z: 1 }, angle); // Cancel y-velocity
      this.applyImpulseAtAngle(force, angle); // Jump
      this.jumpCount--;
    }
  }

  onPlayerAdded(e) {
    // Bind target "this" context to class function (required for event removal)
    e.target.keyDown = e.target.keyDown.bind(e.target);
    e.target.keyUp = e.target.keyUp.bind(e.target);
    e.target.pointerDown = e.target.pointerDown.bind(e.target);
    e.target.pointerUp = e.target.pointerUp.bind(e.target);

    // Add event listeners to document
    document.addEventListener('keydown', e.target.keyDown);
    document.addEventListener('keyup', e.target.keyUp);
    document.addEventListener('pointerdown', e.target.pointerDown);
    document.addEventListener('pointerup', e.target.pointerUp);
  }
  
  onPlayerRemoved(e) {
    // Remove entity event listeners
    e.target.removeEventListener('added', e.target.onPlayerAdded);
    e.target.removeEventListener('removed', e.target.onPlayerRemoved);

    // Remove event listeners
    document.removeEventListener('keydown', e.target.keyDown);
    document.removeEventListener('keyup', e.target.keyUp);
    document.removeEventListener('pointerdown', e.target.pointerDown);
    document.removeEventListener('pointerup', e.target.pointerUp);
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