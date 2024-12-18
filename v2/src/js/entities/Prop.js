import { Empty } from '../core/entities/Empty.js';

/*
  A cuboid is a 6-sided shape that provides a 3D object (Three.js) and
  a 3D rigid body shape (Rapier.js)
*/

class Prop extends Empty {
  // Define static properties
  static model = {
    name: ''
  };

  constructor(options) {
    // Set options with default values
    options = Object.assign({
      color: '#ffffff',
      scale: { x: 1, y: 1, z: 1 }
    }, options);

    // Inherit Entity class
    super(options);
    
    // Set default properties
    this.isProp = true;
    this.type = 'prop';
    this.model = options.model;

    // Bind "this" context to class function (required for event removal)
    this.onPropAdded = this.onPropAdded.bind(this);
    this.addEventListener('added', this.onPropAdded);
  }

  update(delta) {
    super.update(delta);
  }

  animate(delta, alpha) {
    super.animate(delta, alpha);

    // Update model (optional)
    if (this.model && this.model.mixer) {
      this.model.mixer.update(delta);
    }
  }

  onPropAdded(e) {
    // Bind target "this" context to class function (required for event removal)
    this.onPropRemoved = this.onPropRemoved.bind(this);

    // Add optional model to 3D object
    if (this.model.isObject3D) this.object.add(this.model);
    
    // Add prop event listeners
    this.addEventListener('removed', this.onPropRemoved);
  }

  onPropRemoved(e) {
    // Remove model from 3D object
    if (this.model.isObject3D) this.object.remove(this.model);

    // Remove entity event listeners
    this.removeEventListener('removed', this.onPropRemoved);
  }

  toJSON() {
    // Extend entity toJSON with model name
    const json = super.toJSON();

    // Conditionally store model name
    if (this.model.name) json.model = { name: this.model.name };

    // Return json object
    return json;
  }
}

export { Prop };