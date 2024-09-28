import { Euler, Group, Quaternion, Vector3 } from 'three';
import { LightFactory } from './factories/LightFactory.js';
import { EntityFactory } from './factories/EntityFactory.js';

class Level extends Group {
  constructor() {
    super();

    // Define variables
    this.player;
  }

  async load(path, callback = function(){}) {
    // Fetch public folder for level
    await fetch(path).then(function (response) {
      if (response.ok) { return response.json(); }
      throw new Error('Something went wrong');
    })
    .then(function(json) { callback(this.loadJSON(json)); }.bind(this))
    .catch(function(error) { console.error('Error: Level \'' + path + '\' not found.'); return false; });
  }

  loadJSON(json) {
    // Initialize properties
    var entities = [];
    var position = new Vector3();
    var rotation = new Euler();
    var scale = new Vector3();
    var quaternion = new Quaternion();
    var light = LightFactory.create('ambient', { position: { x: 0.25, y: 0.5, z: 1 }});

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
        ccd: true,
        class: child.class.charAt(0).toUpperCase() + child.class.slice(1),
        friction: child.friction || 0,
        model: game.assets.duplicate('cube-' + child.class),
        position: position,
        quaternion: quaternion,
        scale: scale,
        softCcdPrediction: 0.5,
        type: child.isStatic == false ? 'Dynamic' : 'Fixed'
      });

      if (child.class == 'player') {
        this.player = entity;
      }

      // Add 3D object to level
      this.add(entity.object);

      // Add entity to array
      entities.push(entity);
    }.bind(this));

    var beach = EntityFactory.create({
      class: 'TriMesh',
      friction: 0,
      model: game.assets.duplicate('background-tropic'),
      position: { x: 12, y: -3, z: -1 },
      type: 'Fixed'
    });

    this.add(beach.object);
    entities.push(beach);

    // Return array of entities
    return entities;
  }
}

export { Level };