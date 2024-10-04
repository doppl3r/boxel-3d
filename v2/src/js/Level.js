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
    .then(function(json) { callback(this.loadScene(json)); }.bind(this))
    .catch(function(error) { console.error(error); });
  }

  loadScene(scene) {
    // Initialize properties
    var entities = [];
    var light = LightFactory.create('ambient', { position: { x: 0.25, y: 0.5, z: 1 }});

    // Reset level
    this.clear();
    this.add(light);

    // Loop through children
    entities = this.createEntities(scene);

    // Return array of entities
    return entities;
  }

  createEntities(object, entities = []) {
    // Loop through object children
    object.children.forEach(function(child) {
      // Add entity to array
      var entity;
      if (child.children) {
        // Recursively load child entities
        this.createEntities(child, entities);
      }
      else {
        entity = this.createEntity(child);

        if (entity.constructor.name == 'Player') this.player = entity;
    
        // Add 3D object to level
        this.add(entity.object);
  
        // Populate entities array
        entities.push(entity);
      }
    }.bind(this));

    // Return array of entities
    return entities;
  }

  createEntity(object) {
    var position = new Vector3();
    var rotation = new Euler();
    var scale = new Vector3();
    var quaternion = new Quaternion();
    var status = (object.status != null) ? object.status : 1;

    // Update properties
    position.set(object.position.x, object.position.y, object.position.z);
    rotation.set(object.rotation.x, object.rotation.y, object.rotation.z);
    scale.set(object.scale.x, object.scale.y, object.scale.z);
    quaternion.setFromEuler(rotation);

    // Create a new entity from object properties
    var entity = EntityFactory.create({
      ccd: true,
      class: object.type.charAt(0).toUpperCase() + object.type.slice(1),
      friction: object.friction || 0,
      model: game.assets.duplicate('cube-' + object.type),
      position: position,
      quaternion: quaternion,
      scale: scale,
      softCcdPrediction: 0.5,
      status: status,
      type: object.type
    });

    return entity;
  }
}

export { Level };