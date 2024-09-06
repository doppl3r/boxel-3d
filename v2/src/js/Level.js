import { Euler, Group, Quaternion, Vector3 } from 'three';
import { LightFactory } from './factories/LightFactory.js';
import { EntityFactory } from './factories/EntityFactory.js';

class Level extends Group {
  constructor() {
    super();
  }

  async load(path, callback = function(){}) {
    // Fetch public folder for level
    await fetch(path).then(function (response) {
      if (response.ok) { return response.json(); }
      throw new Error('Something went wrong');
    })
    .then(function(json) { callback(this.loadJSON(json)); }.bind(this))
    .catch(function(error) { console.error(error); return false; });
  }

  loadJSON(json) {
    // Initialize properties
    var entities = [];
    var position = new Vector3();
    var rotation = new Euler();
    var scale = new Vector3();
    var quaternion = new Quaternion();
    var light = LightFactory.create('hemisphere');

    // Reset level
    this.clear();
    this.add(light);

    // Loop through children
    json.children.forEach(function(child) {
      // Update properties
      position.set(child.position.x, child.position.y, child.position.z).divideScalar(16);
      rotation.set(child.rotation.x, child.rotation.y, child.rotation.z);
      scale.set(child.scale.x, child.scale.y, child.scale.z).divideScalar(16);
      quaternion.setFromEuler(rotation);

      // Create a new entity from child properties
      var entity = EntityFactory.create({
        class: 'Cube',
        friction: child.friction || 0,
        position: position,
        quaternion: quaternion,
        scale: scale,
        type: child.isStatic == false ? 'Dynamic' : 'Fixed'
      });

      // Add 3D object to level
      this.add(entity.object);

      // Add entity to array
      entities.push(entity);
    }.bind(this));

    // Return array of entities
    return entities;
  }

  update(delta) {
    // Update debugger buffer
    this.debugger.update();
  }
}

export { Level };