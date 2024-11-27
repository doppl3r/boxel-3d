import { SphereGeometry, Mesh, MeshStandardMaterial } from 'three';
import { Ball } from '@dimforge/rapier3d';
import { Entity } from '../core/Entity.js';

/*
  A sphere is a ball shape that provides a 3D object (Three.js) and
  a 3D rigid body shape (Rapier.js)
*/

class Sphere extends Entity {
  constructor(options) {
    // Set options with default values
    options = Object.assign({
      enabledRotations: { x: false, y: false, z: true },
      enabledTranslations: { x: true, y: true, z: false },
      radius: 0.5
    }, options);

    // Create physical shape
    options.shape = new Ball(options.radius);

    // Inherit Entity class
    super(options);

    // Set default properties
    this.isSphere = true;
    this.type = 'sphere';

    // Update 3D object scale
    this.object.scale.set(options.radius * 2, options.radius * 2, options.radius * 2);

    // Add entity event listeners
    this.onSphereAdded = this.onSphereAdded.bind(this);
    this.addEventListener('added', this.onSphereAdded);
  }

  setRadius(radius) {
    var collider = this.rigidBody.collider(0); // First collider

    // Update collider and 3D object scale
    collider.setRadius(radius);
    this.object.scale.set(radius * 2, radius * 2, radius * 2);
  }

  setScale(scale) {
    this.setRadius(scale.x / 2);
  }

  onSphereAdded(e) {
    this.onSphereRemoved = this.onSphereRemoved.bind(this);
    this.addEventListener('removed', this.onSphereRemoved);

    // Add 3D model to 3D object
    if (this.model == null) this.createModel();
    this.object.add(this.model);
  }
  
  onSphereRemoved(e) {
    this.removeEventListener('added', this.onSphereAdded);
    this.removeEventListener('removed', this.onSphereRemoved);
  }

  createModel() {
    var geometry = new SphereGeometry(0.5, 16, 16);
    var material = new MeshStandardMaterial({ color: '#ffffff' });
    this.model = new Mesh(geometry, material);
    this.model.receiveShadow = true;
    this.model.castShadow = true;
  }

  toJSON() {
    // Extend entity toJSON with model name
    const json = super.toJSON();

    // Assign cube properties to entity JSON
    Object.assign(json, {
      type: this.type
    });

    // Conditionally store model name
    if (this.model.name) json.model = { name: this.model.name };

    // Return json object
    return json;
  }
}

export { Sphere };