import { BoxGeometry, Group, LineSegments, Mesh, MeshPhongMaterial, PointLight } from 'three';
import { Bodies, Body, Sleeping, Vector } from 'matter-js';
import { Shapes } from './Shapes.js';

class Cube extends Mesh {
  constructor(options = {}) {
    super();

    // Update null values
    options.x = (options.x == null) ? 0 : options.x;
    options.y = (options.y == null) ? 0 : options.y;
    options.z = (options.z == null) ? 0 : options.z;
    options.scaleX = (options.scaleX == null) ? 1 : options.scaleX;
    options.scaleY = (options.scaleY == null) ? 1 : options.scaleY;
    options.scaleZ = (options.scaleZ == null) ? 1 : options.scaleZ;
    options.segments = (options.segments == null) ? 1 : options.segments;
    options.radius = (options.radius == null) ? 0 : options.radius;
    options.angle = (options.angle == null) ? 0 : options.angle;
    options.color = (options.color == null) ? '#620460' : options.color;
    options.debug = (options.debug == null) ? false : true;

    // Set default properties
    this.shapes = new Shapes();
    this.shapes.addCube(options);
    this.setColors(options.color);
    this.add(this.shapes);
    this.hitbox = Bodies.rectangle(0, 0, options.scaleX, options.scaleY, { class: 'hitbox' });
    this.body = Body.create({
      parts: [this.hitbox],
      friction: 0.0, // Default 0.1
      frictionAir: 0.0, // Default 0.1
      frictionStatic: 0.0, // Default: 0.5, stationary stickiness
      restitution: 0.0, // Default: 0.0, bounciness
      slop: 0.0, // Default: 0.05
      timeScale: 1.0, // Default: 1
      name: this.uuid, // Useful for finding scene object
      class: 'cube'
    });

    // Add helper
    this.helper = new Group();
    this.helper.visible = options.debug;
    this.addHelper(this.hitbox);

    // Update properties from options
    this.name = this.uuid;
    this.isCube = true; // Used for level editor
    this.textEnabled = false;
    this.setPosition({ x: options.x, y: options.y, z: options.z });
    this.setRotation(options.angle);
    this.setScale({ x: options.scaleX, y: options.scaleY, z: options.scaleZ });
    this.setMode();
    this.setJumpMode();
    this.setForceDirection();
  }

  update(delta, alpha) {
    if (alpha) {
      // Interpolate position and rotation
      this.position.x = (this.body.positionPrev.x + (this.body.position.x - this.body.positionPrev.x) * alpha);
      this.position.y = -(this.body.positionPrev.y + (this.body.position.y - this.body.positionPrev.y) * alpha);
      this.rotation.z = -(this.body.anglePrev + (this.body.angle - this.body.anglePrev) * alpha)
    }

    if (this.position.y < -1000) {
      if (this.getClass() == 'player' && this.isStatic() == false) this.kill();
      else {
        app.level.removeObject(this, app);
        //this.resetToOrigin();
      }
    }

    // Update helper
    this.updateHelper();
  }

  updateHelper() {
    if (this.helper && this.helper.visible == true) {
      this.helper.position.x = this.body.position.x;
      this.helper.position.y = -this.body.position.y;
      this.helper.position.z = this.position.z;
      this.helper.rotation.z = -this.body.anglePrev;
      this.helper.scale.copy(this.scale).multiplyScalar(1);
    }
  }

  addHelper(part, options) {
    // Set default options
    if (options == null) options = {};
    if (options.position == null) options.position = { x: 0, y: 0 };
    if (options.color == null) options.color = '#00ff00';
 
    // Update helper cube geometry
    var width = part.bounds.max.x - part.bounds.min.x;
    var height = part.bounds.max.y - part.bounds.min.y;
    var depth = width;
    var cube = new BoxGeometry(width, height, depth);
    var wireframe = new LineSegments(cube, new MeshPhongMaterial({ color: options.color, wireframe: true }));
    this.helper.add(wireframe);
    cube.translate(options.position.x, options.position.y, 0);
  }

  setColors(color, updateOrigin = true) {
    this.color = color; // Update last color
    this.shapes.setColors(color, updateOrigin);
  }

  setPosition(position = {}, updateOrigin = true) {
    // Set null values
    position.x = (position.x == null) ? this.position.x : position.x;
    position.y = (position.y == null) ? this.position.y : position.y;
    position.z = (position.z == null) ? this.position.z : position.z;

    // Update position
    this.position.set(position.x, position.y, position.z);
    Body.setPosition(this.body, { x: position.x, y: -position.y });
    if (updateOrigin == true) this.setPositionOrigin(position);
  }

  setPositionOrigin(position) {
    if (this.positionOrigin == null) this.positionOrigin = {};
    this.positionOrigin.x = position.x;
    this.positionOrigin.y = position.y;
    this.positionOrigin.z = position.z;
  }

  getPosition() {
    return this.position;
  }

  setRotation(rotation, updateOrigin = true) {
    if (typeof rotation == 'object') {
      this.rotation.x = rotation.x;
      this.rotation.y = rotation.y;
      this.rotation.z = rotation.z;
      Body.setAngle(this.body, -rotation.z);
      if (updateOrigin == true) { this.setRotationOrigin(rotation.z); }
    }
    else {
      this.rotation.z = rotation;
      Body.setAngle(this.body, -rotation);
      if (updateOrigin == true) { this.setRotationOrigin(rotation); }
    }
  }

  setRotationOrigin(angle) {
    this.rotationOrigin = angle;
  }

  getRotation(format = 'radians') {
    var value = this.rotation.z; // Default radians
    if (format == 'degrees') value = Math.round(this.rotation.z * (180 / Math.PI));
    return value;
  }

  getRotationOrigin() {
    return this.rotationOrigin;
  }

  setScale(scale = {}, updateOrigin = true) {
    // Resolve null values
    scale.x = (scale.x == null) ? this.scale.x : scale.x;
    scale.y = (scale.y == null) ? this.scale.y : scale.y;
    scale.z = (scale.z == null) ? this.scale.z : scale.z;
    
    // Temporarily set rectangle angle to zero to prevent skewing
    var tempAngle = this.rotation.z;
    this.setRotation(0, false);

    // Scale rectangle by previous scale, then update mesh scale ratio
    this.setBodyScale(scale.x / this.scale.x, scale.y / this.scale.y);
    this.scale.x = scale.x;
    this.scale.y = scale.y;
    this.scale.z = scale.z;
    this.setRotation(tempAngle, false); // Revert angle
    if (updateOrigin == true) this.setScaleOrigin({ x: scale.x, y: scale.y, z: scale.z });
  }

  setBodyScale(x, y) {
    Body.scale(this.body, x, y);
  }

  getScale() {
    return this.scale;
  }

  getScaleOrigin() {
    return this.scaleOrigin;
  }

  setScaleOrigin(scale) {
    if (this.scaleOrigin == null) this.scaleOrigin = {};
    this.scaleOrigin.x = scale.x;
    this.scaleOrigin.y = scale.y;
    this.scaleOrigin.z = scale.z;
  }

  setForceDirection(force = { x: 0, y: 0 }, updateOrigin = true) {
    // Resolve null values
    this.force = force;
    if (updateOrigin == true) { this.setForceDirectionOrigin(force); }
  }

  setForceDirectionOrigin(force) {
    this.forceOrigin = force;
  }

  getForce() {
    return this.force;
  }

  calculateForceDirection(bodyA, bodyB) {
    var force = { x: 0.00025 * bodyB.mass, y: 0 }; // Left-to-right
    force = Vector.rotate(force, bodyA.angle);

    //return force;
    return force;
  }

  resetToOrigin() {
    this.hide(false); // reveal
    this.setPosition(this.positionOrigin, false);
    this.setRotation(this.rotationOrigin, false);
    this.setScale({ x: this.scaleOrigin.x, y: this.scaleOrigin.y, z: this.scaleOrigin.z }, false);
    this.setForceDirection(this.forceOrigin, false);
    this.setStatic(this.isStaticOrigin, false);
    this.setFriction(this.frictionOrigin, false);
    this.setMode(this.modeOrigin, false);
    this.setJumpMode(this.jumpModeOrigin, false);
    Body.setVelocity(this.body, { x: 0, y: 0 });
    Body.setAngularVelocity(this.body, 0);
  }

  setStatic(isStatic = true, updateOrigin = true) {
    Body.setStatic(this.body, isStatic);
    if (updateOrigin == true) this.setStaticOrigin(isStatic);
  }

  setStaticOrigin(isStatic) {
    this.isStaticOrigin = isStatic;
  }

  toggleStatic() {
    var isStatic = !this.body.isStatic;
    this.setStatic(isStatic);
    return isStatic;
  }

  isStatic() {
    return this.body.isStatic;
  }

  setFriction(friction = 0.1, updateOrigin = true) {
    this.body.friction = parseFloat(friction);
    if (updateOrigin == true) this.setFrictionOrigin(friction);
  }

  setFrictionOrigin(friction) {
    this.frictionOrigin = parseFloat(friction);
  }

  getFriction() {
    return this.body.friction;
  }

  setMode(mode, updateOrigin = true) {
    mode = (mode == null) ? 'default' : mode;
    this.mode = mode;
    if (updateOrigin == true) this.setModeOrigin(mode);
    window.dispatchEvent(new CustomEvent('setMode', { detail: mode }));
  }

  setModeOrigin(mode) {
    this.modeOrigin = mode;
  }

  setJumpMode(mode, updateOrigin = true) {
    mode = (mode == null) ? 'limited' : mode;
    this.jumpMode = mode;
    if (updateOrigin == true) this.setJumpModeOrigin(mode);
    window.dispatchEvent(new CustomEvent('setJumpMode', { detail: mode }));
  }

  setJumpModeOrigin(mode) {
    this.jumpModeOrigin = mode;
  }

  getClass() {
    return this.body.class;
  }

  setText(text) {
    if (this.textEnabled === true && text != null) this.text = text;
  }

  getText() { return this.text; }

  select(state = true) {
    this.selected = state;
    if (state == true) {
      this.shapes.setColors('#ffffff', false);
      this.shapes.setOpacities(0.9);
      Body.setVelocity(this.body, { x: 0, y: 0 });
      Body.setAngularVelocity(this.body, 0);
    }
    else {
      this.shapes.resetColors();
      this.shapes.setOpacities(1);
    }
  }

  isSelected() {
    return this.selected;
  }

  setForce(force, object, relativeAngle = false) {
    // Vector of this cube
    var x1 = this.body.positionPrev.x;
    var x2 = this.body.position.x;
    var y1 = this.body.positionPrev.y;
    var y2 = this.body.position.y;
    var angleA = object.body.angle; // Ex: object angle
    var angleB = Math.atan2(y2 - y1, x2 - x1); // Ex: this angle

    // Use relative angle, not object angle
    if (relativeAngle == true) {
      angleA = this.body.angle;
      angleB = this.body.angle + (Math.PI / 2);
      force *= -1 * app.interval.speed; // Newtons 3rd law of pizza
    }

    // Normalize velocity
    var vx = Math.cos(angleB);
    var vy = Math.sin(angleB);

    // Set surface direction
    var nx = -Math.sin(angleA);
    var ny = Math.cos(angleA);

    // Get dot value to calculate reflection
    var dot = (vx * nx) + (vy * ny);

    // Update velocity direction after reflection transforms
    var vnewx = vx - (2 * dot * nx);
    var vnewy = vy - (2 * dot * ny);

    // Reverse force if dot product is negative
    if (dot < 0 && (Math.abs(vnewx) == 1 || Math.abs(vnewy) == 1)) { force *= -1; }

    Body.setVelocity(this.body, { 
      x: vnewx * force,
      y: vnewy * force
    });
    return force;
  }

  getVelocity(object = this) {
    return { 
      x: object.body.position.x - object.body.positionPrev.x,
      y: object.body.position.y - object.body.positionPrev.y
    }
  }

  freeze(state = true) {
    this.body.collisionFilter.category = (state == true) ? 0 : 1;
    Sleeping.set(this.body, state);
  }

  hide(state = true) {
    // Freeze and update visibility
    this.visible = !state;
    this.freeze(state);
  }

  isFrozen() {
    return this.body.collisionFilter.category == 0;
  }

  addLight(color, intensity, distance, castShadow = false) {
    if (this.light == null) {
      this.light = new PointLight(color, intensity, distance);
      this.light.position.set(0, 0, 0);
      this.light.castShadow = castShadow;
      this.add(this.light);
    }
  }

  toJSON() {
    var json = {
      class: this.body.class,
      position: {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z,
      },
      rotation: {
        x: this.rotation.x,
        y: this.rotation.y,
        z: this.rotation.z,
      },
      scale: {
        x: this.scale.x,
        y: this.scale.y,
        z: this.scale.z,
      },
    };

    // Only include non-static data
    if (this.body.isStatic == false) {
      json.isStatic = false;
      json.friction = this.body.friction;
    }

    // Include text if object is a tip
    if (this.textEnabled === true && this.text != null) json.text = this.text;

    // Include color if object has color
    if (this.color != null) json.color = this.color;

    // Return json
    return json;
  }
}

export { Cube };