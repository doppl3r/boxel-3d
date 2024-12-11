import { Vector3 } from 'three';
import { CameraFactory } from '../factories/CameraFactory.js';
import { LightFactory } from '../factories/LightFactory.js';
import { Cube } from './Cube.js';

/*
  A Player is a subclass that extends the Cube class
*/

class Player extends Cube {
  // Define static properties
  static model = {
    name: 'cube-player'
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      activeCollisionTypes: 'ALL',
      activeEvents: 'COLLISION_EVENTS',
      events: [{ name: 'checkCollision' }]
    }, options);

    // Inherit Cube class
    super(options);

    // Set default properties
    this.type = 'player';
    this.keys = {};
    this.pointer = {}
    this.jumpCount = 0;
    this.mode = 'jump';

    // Add light to player
    this.light = LightFactory.create('PointLight', { color: '#dc265a', intensity: Math.PI * 10 });

    // Create camera with offset property
    this.camera = CameraFactory.create('PerspectiveCamera');
    this.cameraOffset = new Vector3(0, 0, 20);

    // Bind "this" context to class function (required for event removal)
    this.onPlayerAdded = this.onPlayerAdded.bind(this);
    this.addEventListener('added', this.onPlayerAdded);
  }

  update(delta) {
    // Call Entity update function
    super.update(delta);

    // Update player controls
    this.updateControls();
  }

  animate(delta, alpha) {
    // Call Entity animate function
    super.animate(delta, alpha);

    // Update camera position
    this.camera.position.copy(this.object.position).add(this.cameraOffset);
  }

  checkCollision(e) {
    if (e.started == true) {
      e.target.jumpCount = 1;
    }
  }

  jump() {
    if (this.mode == 'jump' || this.mode == 'control') {
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
  }

  updateControls() {
    if (this.mode == 'control') {
      let direction = 0;
      let gravity = game.physics.world.gravity;
      let angle = Math.atan2(gravity.y, gravity.x) + (Math.PI / 2);

      // Conditionally assign direction from keyboard input
      if (this.keys['KeyA'] == true) direction = -1;
      else if (this.keys['KeyD'] == true) direction = 1;
      else if (this.keys['ArrowLeft'] == true) direction = -1;
      else if (this.keys['ArrowRight'] == true) direction = 1;

      // Rotate direction vector according to gravity angle
      _vector.copy({ x: direction, y: 0, z: 0 });
      _vector.applyAxisAngle({ x: 0, y: 0, z: 1 }, angle);
      this.setForce(_vector, 2, 14);
    }
  }

  onPlayerAdded(e) {
    // Bind target "this" context to class function (required for event removal)
    this.onPlayerRemoved = this.onPlayerRemoved.bind(this);
    this.keyDown = this.keyDown.bind(this);
    this.keyUp = this.keyUp.bind(this);
    this.pointerDown = this.pointerDown.bind(this);
    this.pointerUp = this.pointerUp.bind(this);
    this.onSetMode = this.onSetMode.bind(this);
    this.onSetGravity = this.onSetGravity.bind(this);

    // Add player light
    this.object.add(this.light);
    
    // Add player event listeners
    this.addEventListener('removed', this.onPlayerRemoved);
    this.addEventListener('setmode', this.onSetMode);
    this.addEventListener('setgravity', this.onSetGravity);

    // Add document event listeners
    document.addEventListener('keydown', this.keyDown);
    document.addEventListener('keyup', this.keyUp);
    document.addEventListener('pointerdown', this.pointerDown);
    document.addEventListener('pointerup', this.pointerUp);
  }
  
  onPlayerRemoved(e) {
    // Remove entity event listeners
    this.removeEventListener('removed', this.onPlayerRemoved);
    this.removeEventListener('setmode', this.onSetMode);
    this.removeEventListener('setgravity', this.onSetGravity);

    // Remove player light
    this.object.remove(this.light);

    // Remove document event listeners
    document.removeEventListener('keydown', this.keyDown);
    document.removeEventListener('keyup', this.keyUp);
    document.removeEventListener('pointerdown', this.pointerDown);
    document.removeEventListener('pointerup', this.pointerUp);
  }

  reset() {
    this.jumpCount = 1;
    super.reset();
  }

  onSetMode(e) {
    this.setMode(e.mode);
  }

  setMode(mode) {
    this.mode = mode;
  }

  onSetGravity(e) {
    this.tween({
      object: { z: this.camera.rotation.z },
      to: { z: e.angle + Math.PI / 2 },
      dynamic: true,
      duration: 250,
      easing: 'Quadratic.InOut',
      onUpdate: function(obj) { this.camera.rotation.z = obj.z }.bind(this)
    }).start();
  }

  keyDown(e) {
    // Assign key inputs to true (once)
    if (e.repeat) return;
    this.keys[e.code] = true;

    // Add keybindings
    if (this.keys['Space'] == true || this.keys['ArrowUp'] == true) this.jump();
  }

  keyUp(e) {
    // Set key values to false
    this.keys[e.code] = false;
  }

  pointerDown(e) {
    // Cancel input for non-canvas elements
    if (e.target.nodeName != 'CANVAS') return;
    
    // Add touch bindings
    this.pointer[e.which] = true;
    if (this.pointer[1] == true) this.jump();
  }
  
  pointerUp(e) {
    this.pointer[e.which] = false;
  }
}

// Assign local helper components
let _vector = new Vector3();

export { Player };