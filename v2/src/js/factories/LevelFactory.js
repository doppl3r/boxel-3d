import { Euler, Quaternion, Vector3 } from 'three';
import { LightFactory } from './LightFactory.js';
import { EntityFactory } from './EntityFactory.js';

class LevelFactory {
  constructor() {
    // Define variables
  }

  static loadFile(path, callback = function(){}) {
    // Fetch public folder for level
    fetch(path).then(function (response) {
      if (response.ok) { return response.json(); }
      throw new Error('Something went wrong');
    })
    .then(function(json) { callback(this.loadFromJSON(json)); }.bind(this))
    .catch(function(error) { console.error(error); });
  }

  static loadFromJSON(json) {
    // Initialize properties
    var entities = [];

    // Loop through children
    entities = this.createEntities(json);

    // Add ambient light
    var light = EntityFactory.create({
      class: 'Light',
      model: LightFactory.create('ambient'),
      position: { x: 0, y: 4, z: 0 }
    });
    entities.push(light);

    // Return array of entities
    return entities;
  }

  static createEntities(json, entities = [], parent) {
    // Loop through children
    json.children.forEach(function(child) {
      // Add entity to array
      var entity = this.createEntity(child);

      // Assign parent
      entity.parent = parent;

      // Populate entities array
      entities.push(entity);
      
      // Recursively load child entities
      if (child.children) {
        this.createEntities(child, entities, entity);
      }
    }.bind(this));

    // Return array of entities
    return entities;
  }

  static createEntity(json) {
    var position = new Vector3();
    var rotation = new Euler();
    var scale = new Vector3();
    var quaternion = new Quaternion();
    var status = (json.status != null) ? json.status : 1;

    // Update properties
    position.set(json.position.x, json.position.y, json.position.z);
    rotation.set(json.rotation.x, json.rotation.y, json.rotation.z);
    scale.set(json.scale.x, json.scale.y, json.scale.z);
    quaternion.setFromEuler(rotation);

    // Create a new entity from json properties
    var options = Object.assign({
      ccd: true,
      class: json.type.charAt(0).toUpperCase() + json.type.slice(1),
      friction: json.friction || 0,
      model: game.assets.duplicate('cube-' + json.type),
      position: position,
      quaternion: quaternion,
      scale: scale,
      softCcdPrediction: 0.5,
      status: status,
      type: json.type
    }, json);
    var entity = EntityFactory.create(options);

    return entity;
  }
}

export { LevelFactory };