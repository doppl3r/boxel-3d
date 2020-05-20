class Level extends THREE.Group {
    constructor() {
        super();
        this.name = 'My Level';
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
        var length = a.level.children.length;
        for (var i=0; i < length; i++) {
            var child = a.level.children[0];
            this.removeObject(child, a, true);
        }
    }

    createNewLevel(a) {
        a.player.setPosition(); // Reset player position
        this.clearLevel(a);
        this.add(a.player); // Add player object
        var floor = new Cube({ x: 0, y: -64, z: 0 });
        floor.setScale(64, 16, 16);
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
            levelJSON.children.push(objectData);
        }
        return levelJSON;
    }

    saveLevel(a) {
        a.storage.updateLevelToStorage(this.key, this.exportToJSON(a));
    }

    importFromJSON(levelData, a) {
        this.name = levelData.name;
        this.key = levelData.key;

        // Loop through JSON level data
        for (var i = 0; i < levelData.children.length; i++) {
            var object = new Cube();
            var objectData = levelData.children[i];
            if (objectData.class == 'player') object = a.player;
            this.setObjectProperties(object, objectData);
            this.addObject(object, a);
        }
    }

    setObjectProperties(object, objectData) {
        object.setPosition(objectData.position.x, objectData.position.y, objectData.position.z);
        object.setScale(objectData.scale.x, objectData.scale.y, objectData.scale.z);
        object.setRotation(objectData.rotation.z);
        object.setStatic(objectData.isStatic);
    }
}