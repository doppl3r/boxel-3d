import { DoubleSide, Mesh, MeshPhongMaterial, PlaneGeometry, SRGBColorSpace, TextureLoader, Vector2 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Body, Query, Vector } from 'matter-js';
import { Utility } from '../Utility.js';
import { Cube } from './Cube.js';
import { Rope } from '../Rope.js';

class Player extends Cube {
  constructor(options = {}) {
    super(options);
    this.body.class = 'player';

    // Update body
    this.setScale({ x: 16, y: 16, z: 16 });
    this.setStatic(false);
    this.setColors('#dc265a');
    this.setMode('jump'); // Default 'jump'
    this.util = new Utility();
    this.mass = 5;
    this.allowJump = false;
    this.addLight('#dc265a', 16000, 500, false);
    this.controls = { left: 0, right: 0, acceleration: 0.5, speed: 4 };
    this.rope = new Rope();
    this.skin = { url: '' };

    // Add an invisible plane to player for rope raycaster mechanics
    this.plane = new Mesh(new PlaneGeometry(1000, 1000), new MeshPhongMaterial({ visible: false, side: DoubleSide }));
    this.add(this.plane);
  }

  setScale(scale = {}, updateOrigin = true) {
    super.setScale(scale, updateOrigin);
  }

  jump() {
    if (this.mode == 'jump' || this.mode == 'control') {
      if (this.allowJump == true) {
        this.allowJump = false;
  
        // Define jump conditions
        var gravity = app.engine.world.gravity;
        var gravityAngle = (Math.PI / 2) - Vector.angle({ x: 0, y: 0 }, gravity);
        var velocity = this.body.velocity;
        var spinDirection = 1; // Default clockwise
        var angularVelocity = (Math.PI / 20);
        var forceScale = 0.025; // Default 0.025
        //var forceScale = 0.025 * 0.5; // Default 0.025
        var force = {
          x: -(gravity.x * forceScale * this.body.mass),
          y: -(gravity.y * forceScale * this.body.mass)
        };
  
        // Rotate velocity angle back to 0 degrees, remove y velocity, then rotate back to gravity angle
        velocity = Vector.rotate(velocity, gravityAngle);
        velocity.y = 0; // Reset vertical velocity to 0
        spinDirection = velocity.x >= 0 ? 1 : -1;
        angularVelocity *= spinDirection;
        velocity = Vector.rotate(velocity, -gravityAngle);
  
        // Disable angular velocity at slower speeds
        if (this.body.speed < this.controls.speed * 0.25) angularVelocity = 0;
  
        // Use engine to modulate object
        Body.setVelocity(this.body, velocity);
        Body.setAngularVelocity(this.body, angularVelocity);
        Body.applyForce(this.body, this.body.position, force);

        // Play jump sound
        app.assets.audio.play('pop2');
      }
    }
  }

  setControls(name, value) {
    this.controls[name] = value;
  }

  updateControls() {
    if (this.mode == 'control') {
      // Original credit: https://github.com/Charlieee1/
      var gravity = app.engine.world.gravity;
      var direction = (this.controls.left + this.controls.right); // -1, 0, 1
      var force = { x: gravity.y * direction, y: -gravity.x * direction };
      var velocity = this.body.velocity;
      var speed = Vector.dot(velocity, force);
      var speedMax = 4;
      var speedNext = speed + this.controls.acceleration; // Ex: 0.5 to 4.5
      var speedClamped = Math.max(speed, Math.min(speedNext, speedMax));
      var acceleration = speedClamped - speed; // Ex: 0.5 (or 0 at max speed)

      // Update velocity using new force
      velocity.x += force.x * acceleration;
      velocity.y += force.y * acceleration;
      Body.setVelocity(this.body, velocity);
    }
  }

  addRope(mouse) {
    // Add constraint
    if (this.mode == 'grapple' && this.isFrozen() == false){
      var spacing = 4; // Smaller = more precise
      var length = 400; // How far to check for objects beyond p2
      var dx = mouse.x - this.position.x;
      var dy = mouse.y - this.position.y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      var p1 = { x: this.position.x, y: -this.position.y };
      var p2 = { 
        x: (this.position.x + (mouse.x - this.position.x) * length / distance),
        y: -(this.position.y + (mouse.y - this.position.y) * length / distance)
      };

      // Clear existing rope to prevent duplicate chains
      this.removeRope();

      for (var i = 0; i < length; i += spacing) {
        var percent = i / (length);
        var point = { 
          x: p1.x + ((p2.x - p1.x) * percent),
          y: p1.y + ((p2.y - p1.y) * percent)
        };
        var collision = Query.point(app.engine.world.bodies, point);
        
        // Add rope if collision detected
        if (collision.length > 0 && collision[0].class != "player") {
          // Check if object is visible or on zero z-plane
          var obj = app.level.getObjectByName(collision[0].name);
          if (obj.visible == true) {
            if (obj.position.z == 0) {
              app.level.add(this.rope);
              this.rope.addJoints(this.body, collision[0], point); // bodyA, bodyB, point
              this.updateRope();
              break;
            }
          }
        }
      }

      // Play ice sound
      app.assets.audio.play('ice');
    }
  }

  updateForce() {
    // Apply force to body until it reaches it's max speed (generic)
    if (this.body.speed < this.controls.speed) {
      Body.applyForce(this.body, this.body.position, {
        x: this.force.x * app.loop.speed,
        y: this.force.y * app.loop.speed
      });
    }
  }

  updateRope() {
    this.rope.updateJoints();
  }

  removeRope() {
    this.rope.removeJoints();
    app.level.remove(this.rope);
  }

  kill() {
    if (this.isFrozen() == false) {
      this.freeze(true);
      this.visible = false;
      this.killTimeout = setTimeout(function() { this.restart(); }.bind(this), 1000); // Respawn in 1 second
      var rows = 4, cols = 4, layers = 4;
      var scale = { x: this.scale.x / cols, y: this.scale.y / rows, z: this.scale.z / layers }
      for (var row = -rows / 2; row < rows / 2; row++) {
        for (var col = -cols / 2; col < cols / 2; col++) {
          var randAngle = this.util.randomNumber(0, 360 * (Math.PI / 180));
          var particleData = {
            color: this.color,
            position: { 
              x: this.position.x + (col * scale.x) + (scale.x / 2),
              y: this.position.y + (row * scale.y) + (scale.y / 2), 
              z: 0
            },
            rotation: { x: 0, y: 0, z: randAngle },
            scale: { x: scale.x, y: scale.y, z: scale.z },
            isStatic: false,
            friction: 0
          };
          var particle = app.level.entityFactory.createObject('cube');
          app.level.setObjectProperties(particle, particleData);
          app.level.addObject(particle, app);
          particle.isParticle = true;
          particle.setColors(this.color);
          Body.setVelocity(particle.body, this.body.velocity);
        }
      }
    }

    // Dispatch kill event
    window.dispatchEvent(new CustomEvent('playerKill', { detail: { player: this }}));

    // Play kill sound
    app.assets.audio.play('glass');
  }

  cancelRestart() {
    // Clear potential timeout from player kill
    clearTimeout(this.killTimeout);
  }

  saveCheckpoint(position) {
    if (this.checkpoint == null) this.checkpoint = {};
    this.checkpoint.x = position.x;
    this.checkpoint.y = position.y;
    this.checkpoint.z = position.z;
  }

  removeCheckpoint() {
    this.checkpoint = null;
  }

  setPositionToCheckpoint() {
    if (this.checkpoint != null) {
      this.setPosition({
        x: this.position.x = this.checkpoint.x,
        y: this.position.y = this.checkpoint.y,
        z: this.position.z = this.checkpoint.z
      }, false);
    }
  }

  respawn(override = false) {
    // Override is used when a checkpoint set
    if (this.isFrozen() == true || override == true) {
      app.level.removeParticles(app);
      this.resetToOrigin();
      this.setPositionToCheckpoint();

      // Dispatch respawn event
      window.dispatchEvent(new CustomEvent('playerRespawn', { detail: { player: this }}));
    }
  }

  restart() {
    app.level.retryLevel(app, true);

    // Dispatch restart event
    window.dispatchEvent(new CustomEvent('playerRestart', { detail: { player: this }}));
  }

  finish() {
    if (app.play == true) {
      // Set time values
      var levelName = app.level.name;
      var time = app.timer.toString();
      var hasNewScore = app.storage.saveScore(levelName, time);
      var text = 'Finished!<br>Score: ' + time;
  
      // Rerender timer
      app.timer.render(time);
  
      // Show new record text
      if (hasNewScore == true) text += '<br><em>New record!</em>';
      app.play = false;
  
      // Dispatch finished event
      window.dispatchEvent(new CustomEvent('levelFinish', { detail: { time: time, level: levelName }}));
  
      // Dispatch new popup from event
      window.dispatchEvent(new CustomEvent('openPopup', {
        detail: {
          text: text,
          inputs: [
            { value: 'popup.button.retry', type: 'button', callback: function() { app.level.retryLevel(app); window.dispatchEvent(new CustomEvent('closePopup')); }},
            { value: 'popup.button.continue', type: 'button', callback: function() { app.level.exitLevel(app); window.dispatchEvent(new CustomEvent('closePopup')); }}
          ]
        }
      }));

      // Play success sound
      app.assets.audio.play('clap');
      app.assets.audio.play('success');
    }
  }

  shrink() {
    this.setScale({ 
      x: this.scale.x / 2, 
      y: this.scale.y / 2, 
      z: this.scale.z / 2 
    }, false);
  }

  grow() {
    this.setScale({ 
      x: this.scale.x * 2, 
      y: this.scale.y * 2, 
      z: this.scale.z * 2 
    }, false);
  }

  renderSpeed(a) {
    var speed = this.body.speed;
    var maxSpeed = 10;
    var newSpeed = 0;
    var width = newSpeed + '%;';

    // Clamp speed and update style attribute
    if (speed > maxSpeed) speed = maxSpeed;
    newSpeed = (speed / maxSpeed) * 100;
    width = 'width: calc(' + newSpeed + '% - 8px)';
    if (a.document.getElementById('speed')) {
      a.document.getElementById('speed').setAttribute('style', width);
    }
  }

  setSkin(skin = {}, a = app) {
    // Add texture
    this.addTexture(skin);
  }

  reset() {
    app.updateGravity();
    this.setForceDirection();
    this.setScale({ x: this.scaleOrigin.x, y: this.scaleOrigin.y, z: this.scaleOrigin.z }, false);
    this.setMode(this.modeOrigin, false);
    this.controls.left = this.controls.right = 0;

    // Play teleport audio
    app.assets.audio.play('teleport');
  }

  addTexture(skin) {
    // Check if skin URL exists
    if (skin.url) {
      // Fix public path (v2.2.3+)
      skin.url = skin.url.replace('img/png/skins/', '../png/');

      // Load texture using url
      var loader = new TextureLoader();
      loader.load(skin.url, 
        function(texture){
          texture.colorSpace = SRGBColorSpace;
          this.remove(this.skin); // Reset skin
          this.shapes.visible = false;
          var geometry = new RoundedBoxGeometry(1, 1, 1, 1, 0.1); // width, height, depth, segments, radius
          var material = new MeshPhongMaterial({ map: texture, transparent: true, opacity: 1 });
          this.shapes.setOpacities(0);
          this.skin = new Mesh(geometry, material);
          this.skin.url = skin.url;
          this.add(this.skin);
        }.bind(this),
        undefined,
        function(err) {
          console.error( 'An error happened: ', err );
        }.bind(this)
      );
    }
  }
}

const _vector = new Vector2();

export { Player };