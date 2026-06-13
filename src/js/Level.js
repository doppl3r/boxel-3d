import { Group } from 'three';
import { World } from 'matter-js';
import { EntityFactory } from './entities/EntityFactory.js';
import { levels, themes } from '../js/Data.js';

class Level extends Group {
  constructor() {
    super();
    this.name = this.defaultName = 'My Level';
    this.theme = this.defaultTheme = 'classic';
    this.entityFactory = new EntityFactory();
    this.publishedFileId = null; // Reserved for Steam itemIds
    this.zoom = undefined;
  }

  addObject(object) {
    // Prevent multiple player objects from being added to the level
    if (object.getClass() == 'player' && object !== app.player) return

    // Update body state (-1 == active physics)
    if (object.position.z == 0) {
      World.add(app.engine.world, object.body); // Add hitbox to world
      this.parent.add(object.helper);
    }
    
    // Add to group and compute world matrix once (scene.matrixWorldAutoUpdate is off)
    this.add(object);
    object.updateMatrixWorld();
    object.updateHelper();
  }

  removeObject(object, override = false) {
    // Prevent deleting the player
    if ((app.selectedObject != null && app.selectedObject.getClass() != 'player') || override == true) {
      if (object != undefined) {
        World.remove(app.engine.world, object.body);
        this.parent.remove(object.helper);
        this.remove(object);
        this.deselectLevel();
      }
    }
  }

  clearLevel() {
    var length = this.children.length;
    this.name = this.defaultName;
    this.theme = this.defaultTheme;
    this.zoom = undefined;
    app.player.removeRope();
    for (var i=0; i < length; i++) {
      var child = this.children[0];
      this.removeObject(child, true);
    }
  }

  removeParticles() {
    var length = this.children.length;
    var index = length - 1;
    while (index >= 0) {
      var child = this.children[index];
      if (child.isParticle != null) this.removeObject(child, true);
      index--;
    }
  }

  refreshLevel() {
    // Useful for updating all static objects
    var levelData = this.exportToJSON();
    this.clearLevel();
    this.importFromJSON(levelData);
  }

  refreshObject(object) {
    this.removeObject(object); // Clear old object from world/engine
    var newObject = this.duplicateObject(object);
    return newObject;
  }

  changeObjectType(object, type) {
    var newObject = object; // Default as self
    if (object.getClass() != 'player') {
      object.body.class = type;
      newObject = this.refreshObject(object);
    }
    return newObject;
  }

  duplicateObject(object) {
    // Prevent duplicating the player object
    if (object.getClass() == 'player') return object;

    var objectData = object.toJSON();
    var newObject = this.entityFactory.createObject(objectData.class);
    this.setObjectProperties(newObject, objectData);
    this.addObject(newObject);
    return newObject;
  }

  createNewLevel() {
    // Reset player properties
    app.player.setPosition({ x: 0, y: 0, z: 0 });
    app.player.setScale({ x: 16, y: 16, z: 16 });
    app.player.setRotation(0);
    app.player.setFriction(0);

    // Prepare level with a single floor
    this.clearLevel();
    this.add(app.player); // Add player object
    var floor = this.entityFactory.createObject('cube', { x: 0, y: -64, z: 0 });
    floor.setScale({ x: 64, y: 16, z: 16 });
    floor.setStatic(true);
    this.add(floor);
  }

  deselectLevel() {
    app.selectedObject = null;
    for (var i=0; i < this.children.length; i++) {
      var child = this.children[i];
      if (child.body != null) {
        child.select(false);
      }
    }
  }

  exportToJSON() {
    var levelJSON = {};
    levelJSON.name = this.name;
    levelJSON.theme = this.theme;
    levelJSON.description = this.description;
    levelJSON.zoom = this.zoom;
    levelJSON.version = app.version;
    levelJSON.children = [];

    // Loop through group children
    for (var i = 0; i < this.children.length; i++) {
      var object = this.children[i];
      if (object.type == "Mesh") {
        var objectData = object.toJSON();
        levelJSON.children.push(objectData);
      }
    }
    return levelJSON;
  }

  saveLevelData() {
    this.key = app.storage.setLevelData(this.key, this.exportToJSON());
    return this.key;
  }

  importFromJSON(levelData) {
    this.name = levelData.name;
    this.theme = levelData.theme;
    this.description = levelData.description;
    this.zoom = levelData.zoom;

    // Loop through JSON level data
    for (var i = 0; i < levelData.children.length; i++) {
      var settings = app.storage.getSettings();
      var objectData = levelData.children[i];
      var object = this.entityFactory.createObject(objectData.class);
      if (objectData.class == 'player') object = app.player;
      object.helper.visible = settings.debug;
      this.setObjectProperties(object, objectData);
      this.addObject(object);
    }
  }

  resetLevel() {
    // Gets called every time the level starts (including checkpoints)
    for (var i = 0; i < this.children.length; i++) {
      var child = this.children[i];
      child.resetToOrigin();
      child.updateMatrixWorld();
      child.updateHelper();
    }
  }

  retryLevel(keepCheckpoint = false) {
    app.updateGravity();
    app.play = true;
    app.level.removeParticles();
    app.player.cancelRestart();
    app.resetScene();
    window.dispatchEvent(new CustomEvent('closePopup'));
    
    // Remove checkpoint, or respawn to checkpoint
    if (keepCheckpoint == false || app.player.checkpoint == null) {
      app.timer.reset();
      app.timer.start();
      app.player.removeCheckpoint();
    }
    else app.player.respawn(true);
  }

  exitLevel() {
    app.timer.reset();
    app.player.removeCheckpoint();

    // Check current state
    if (app.state == 'campaign') {
      var settings = app.storage.getSettings();
      var progress = parseInt(settings.progress)
      progress++; // Increase level progress
      settings.progress = progress;
      app.updateSettings(settings);
      window.dispatchEvent(new CustomEvent('setPage', { detail: 'level-picker' }));
    }
    else if (app.state == 'level-editor') {
      app.updateGravity();
      app.resetScene();
      app.levelEditor.controlsOrbit.enabled = true;
      app.levelEditor.controlsOrbit.reset();
      app.background.visible = false;
    }

    // Dispatch event after exiting level
    window.dispatchEvent(new CustomEvent('exitLevel', { detail: app.state }));
  }

  setObjectProperties(object, objectData) {
    object.setPosition({ x: objectData.position.x, y: objectData.position.y, z: objectData.position.z });
    object.setScale({ x: objectData.scale.x, y: objectData.scale.y, z: objectData.scale.z });
    object.setRotation({ x: objectData.rotation.x, y: objectData.rotation.y, z: objectData.rotation.z });
    object.setStatic(objectData.isStatic);
    object.setText(objectData.text);
    object.setFriction(objectData.friction);
    object.setColors(objectData.color || app.level.entityFactory.color);
  }

  showTip(text) {
    // Pause game
    app.play = false;
    app.timer.pause();

    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: text,
        inputs: [{ type: 'button', value: 'popup.button.continue', callback: function() {
          app.resumeLevel();
        }}]
      }
    }));

    // Play tip sound
    app.assets.audio.play('tip');
  }

  showHelpers(visible = true) {
    this.traverse(function(obj) {
      if (obj.helper) obj.helper.visible = visible;
    });
  }

  updateHelpers() {
    this.children.forEach(function(child) {
      if (child.helper) child.updateHelper();
    })
  }

  getTheme(name) {
    // Return theme object by name
    return themes[name];
  }

  getPackTheme(title) {
    // Loop through levels json
    var theme;
    levels.packs.forEach(function(pack) {
      pack.levels.forEach(function(level) {
        // Assign theme using theme pack key
        if (title == level.title) theme = themes[pack.theme];
      })
    });
    return theme;
  }

  getDescriptionByTitle(title) {
    var description;
    levels.packs.forEach(function(pack) {
      pack.levels.forEach(function(level) {
        // Assign theme using theme pack key
        if (title == level.title) description = level.description;
      })
    });
    return description;
  }

  getAuthorByTitle(title) {
    var author;
    levels.packs.forEach(function(pack) {
      pack.levels.forEach(function(level) {
        // Assign theme using theme pack key
        if (title == level.title) author = level.author;
      })
    });
    return author;
  }

  getLevelIndex(title) {
    var count = 0;
    var index = -1;
    
    // Loop through packs array
    levels.packs.forEach(function(pack) {
      // Loop through each levels array
      pack.levels.forEach(function(level) {
        // Set level index and increment count
        if (title == level.title) {
          index = count;
        }
        count++;
      });
    });
    return index;
  }
}

export { Level };