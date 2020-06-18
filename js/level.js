class Level extends THREE.Group {
    constructor() {
        super();
        this.name = this.defaultName = 'My Level';
    }

    addObject(object, a) {
        Matter.World.add(a.engine.world, object.body); // Add hitbox to world
        this.add(object); // Add to group
    }

    removeObject(object, a, override = false) {
        // Prevent deleting the player
        if ((a.selectedObject != null && a.selectedObject.getClass() != 'player') || override == true) {
            Matter.World.remove(a.engine.world, object.body);
            this.remove(object);
            a.deselectScene(a);
            a.ui.showObjectOptions(false);
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

    createNewLevel(a) {
        a.player.setPosition(); // Reset player position
        this.clearLevel(a);
        this.add(a.player); // Add player object
        var floor = new Cube({ x: 0, y: -64, z: 0 });
        floor.setScale({ x: 64, y: 16, z: 16 });
        floor.setStatic(true);
        this.add(floor);
    }

    exportToJSON(a) {
        var levelJSON = {};
        levelJSON.name = this.name;
        levelJSON.key = this.key;
        levelJSON.children = [];

        // Loop through THREE.js group children
        for (var i = 0; i < a.level.children.length; i++) {
            var object = a.level.children[i];
            var objectData = {};
            objectData.isStatic = object.isStatic();
            objectData.class = object.getClass();
            objectData.position = { x: object.position.x, y: object.position.y, z: object.position.z };
            objectData.rotation = { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z };
            objectData.scale = { x: object.scale.x, y: object.scale.y, z: object.scale.z };
            if (object.text != null) objectData.text = object.text; // Tip text
            levelJSON.children.push(objectData);
        }
        return levelJSON;
    }

    saveLevelData(a) {
        a.storage.setLevelData(this.exportToJSON(a));
    }

    importFromJSON(levelData, a) {
        this.name = levelData.name;
        this.key = levelData.key;

        // Loop through JSON level data
        for (var i = 0; i < levelData.children.length; i++) {
            var objectData = levelData.children[i];
            var object = a.newObject(objectData.class);
            if (objectData.class == 'player') object = a.player;
            this.setObjectProperties(object, objectData);
            this.addObject(object, a);
        }
    }

    retryLevel(a) {
        a.play = true;
        a.player.removeCheckpoint();
        a.resetScene(a);
    }

    exitLevel(a) {
        // TODO: Got to "home" screen
    }

    setObjectProperties(object, objectData) {
        object.setPosition({ x: objectData.position.x, y: objectData.position.y, z: objectData.position.z });
        object.setScale({ x: objectData.scale.x, y: objectData.scale.y, z: objectData.scale.z });
        object.setRotation(objectData.rotation.z);
        object.setStatic(objectData.isStatic);
        object.setText(objectData.text);
    }
}