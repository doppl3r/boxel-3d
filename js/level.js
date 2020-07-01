class Level extends THREE.Group {
    constructor() {
        super();
        this.name = this.defaultName = 'My Level';
    }

    addObject(object, a) {
        Matter.World.add(a.engine.world, object.body); // Add hitbox to world
        this.add(object); // Add to group
    }

    createObject(type, options) {
        var object;
        switch(type) {
            case('player'): object = new Player(options); break;
            case('tip'): object = new Tip(options); break;
            case('bounce'): object = new Bounce(options); break;
            case('checkpoint'): object = new Checkpoint(options); break;
            case('spike'): object = new Spike(options); break;
            case('shrink'): object = new Shrink(options); break;
            case('grow'): object = new Grow(options); break;
            case('finish'): object = new Finish(options); break;
            default: object = new Cube(options);
        }
        return object;
    }

    removeObject(object, a, override = false) {
        // Prevent deleting the player
        if ((a.selectedObject != null && a.selectedObject.getClass() != 'player') || override == true) {
            Matter.World.remove(a.engine.world, object.body);
            this.remove(object);
            a.level.deselectLevel(a);
        }
    }

    clearLevel(a) {
        this.name = this.defaultName;
        var length = a.level.children.length;
        for (var i=0; i < length; i++) {
            var child = a.level.children[0];
            this.removeObject(child, a, true);
        }
    }

    removeParticles(a) {
        var length = a.level.children.length;
        var index = length - 1;
        while (index >= 0) {
            var child = a.level.children[index];
            if (child.isParticle != null) this.removeObject(child, a, true);
            index--;
        }
    }

    refreshLevel(a) {
        // Useful for updating all static objects
        var levelData = this.exportToJSON(a);
        this.clearLevel(a);
        this.importFromJSON(levelData, a);
    }

    refreshObject(object, a) {
        this.removeObject(object, a); // Clear old object from world/engine
        var newObject = this.duplicateObject(object, a);
        return newObject;
    }

    changeObjectType(object, type, a) {
        var newObject = object; // Default as self
        if (object.getClass() != 'player') {
            object.body.class = type;
            newObject = this.refreshObject(object, a);
        }
        return newObject;
    }

    duplicateObject(object, a) {
        var objectData = this.exportObjectToJSON(object);
        var newObject = this.createObject(objectData.class);
        this.setObjectProperties(newObject, objectData);
        this.addObject(newObject, a);
        return newObject;
    }

    createNewLevel(a) {
        a.player.setPosition(); // Reset player position
        a.player.setScale({ x: 16, y: 16, z: 16 });
        this.clearLevel(a);
        this.add(a.player); // Add player object
        var floor = new Cube({ x: 0, y: -64, z: 0 });
        floor.setScale({ x: 64, y: 16, z: 16 });
        floor.setStatic(true);
        this.add(floor);
    }

    deselectLevel(a) {
        a.selectedObject = null;
        for (var i=0; i < a.level.children.length; i++) {
            var child = a.level.children[i];
            if (child.body != null) {
                child.select(false);
            }
        }
    }

    exportToJSON(a) {
        var levelJSON = {};
        levelJSON.name = this.name;
        levelJSON.children = [];

        // Loop through THREE.js group children
        for (var i = 0; i < a.level.children.length; i++) {
            var object = a.level.children[i];
            var objectData = this.exportObjectToJSON(object);
            levelJSON.children.push(objectData);
        }
        return levelJSON;
    }

    exportObjectToJSON(object) {
        var objectJSON = {};
        objectJSON.isStatic = object.isStatic();
        objectJSON.class = object.getClass();
        objectJSON.position = { x: object.position.x, y: object.position.y, z: object.position.z };
        objectJSON.rotation = { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z };
        objectJSON.scale = { x: object.scale.x, y: object.scale.y, z: object.scale.z };
        if (object.text != null) objectJSON.text = object.text; // Tip text
        return objectJSON;
    }

    saveLevelData(a) {
        a.storage.setLevelData(this.key, this.exportToJSON(a));
    }

    importFromJSON(levelData, a) {
        this.name = levelData.name;

        // Loop through JSON level data
        for (var i = 0; i < levelData.children.length; i++) {
            var objectData = levelData.children[i];
            var object = this.createObject(objectData.class);
            if (objectData.class == 'player') object = a.player;
            this.setObjectProperties(object, objectData);
            this.addObject(object, a);
        }
    }

    resetLevel(a) {
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            child.resetToOrigin();
        }
    }

    retryLevel(a) {
        a.play = true;
        a.level.removeParticles(a);
        a.player.removeCheckpoint();
        a.resetScene(a);
    }

    exitLevel(a) {
        a.player.removeCheckpoint();
        a.level.removeParticles(a);

        if (a.ui.state == 'play') {
            app.ui.updateUI('level-picker');
        }
        else if (a.ui.state == 'level-editor') {
            a.resetScene(a);
        }
    }

    setObjectProperties(object, objectData) {
        object.setPosition({ x: objectData.position.x, y: objectData.position.y, z: objectData.position.z });
        object.setScale({ x: objectData.scale.x, y: objectData.scale.y, z: objectData.scale.z });
        object.setRotation(objectData.rotation.z);
        object.setStatic(objectData.isStatic);
        object.setText(objectData.text);
    }
}