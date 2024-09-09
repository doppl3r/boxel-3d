import { BoxGeometry, Mesh, MeshStandardMaterial } from 'three';
import { Cuboid } from '@dimforge/rapier3d';
import { Entity } from './Entity.js';

/*
  A cuboid is a 6-sided shape that provides a 3D object (Three.js) and
  a 3D rigid body shape (Rapier.js)
*/

class Cube extends Entity {
  constructor(options) {
    // Set options with default values
    options = Object.assign({
      color: '#ffffff',
      enabledRotations: { x: false, y: false, z: true },
      enabledTranslations: { x: true, y: true, z: false },
      scale: { x: 1, y: 1, z: 1 }
    }, options);

    // Create physical shape
    options.shape = new Cuboid(options.scale.x / 2, options.scale.y / 2, options.scale.z / 2);

    // Initialize default cube model mesh
    if (options.model == null) {
      var geometry = new BoxGeometry(1, 1, 1);
      var material = new MeshStandardMaterial({ color: options.color });
      options.model = new Mesh(geometry, material);
      options.model.receiveShadow = true;
      options.model.castShadow = true;
    }

    // Inherit Entity class
    super(options);

    // Define global properties
    this.model;
    if (options.model) {
      this.model = options.model;
      this.object.add(this.model);
    }

    // Update 3D object scale
    this.object.scale.copy(options.scale)
  }

  update(delta) {
    super.update(delta);
  }

  render(delta, alpha) {
    super.render(delta, alpha);

    // Update model (optional)
    if (this.model && this.model.mixer) {
      this.model.mixer.update(delta);
    }
  }
}

export { Cube };