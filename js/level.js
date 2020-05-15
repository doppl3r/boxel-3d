class Level extends THREE.Group {
    constructor() {
        super();
        this.name = 'My Level';
    }

    addObject = function(object, a) {
        Matter.World.add(a.engine.world, object.rectangle); // Add hitbox to world
        this.add(object); // Add to group
    }

    removeObject = function(object, a) {
        // Prevent deleting the player
        if (object != a.player) {
            Matter.World.remove(a.engine.world, object.rectangle);
            this.remove(object);
            a.deselectScene(a);
            a.ui.showObjectOptions(false);
        }
    }

    clearLevel = function(a) {
        var length = a.level.children.length;
        for (var i=0; i < length; i++) {
            var child = a.level.children[0];
            this.removeObject(child, a);
        }
    }

    createNewLevel = function(a) {
        a.player.setPosition(); // Reset player position
        this.clearLevel(a);
        this.add(a.player); // Add player object
        var floor = new Cube({ x: 0, y: -64, z: 0 });
        floor.setScale(64, 16, 16);
        floor.setStatic(true);
        this.add(floor);
    }

    exportToJSON = function(a) {
        var json = {};
        json.name = this.name;
        json.key = this.key;
        json.children = [];
        for (var i = 0; i < a.level.children.length; i++) {
            var object = {};
            var child = a.level.children[i];
            object.isStatic = child.isStatic();
            object.class = child.getClass();
            object.color = child.getColor();
            object.position = { x: child.position.x, y: child.position.y, z: child.position.z };
            object.rotation = { x: child.rotation.x, y: child.rotation.y, z: child.rotation.z };
            object.scale = { x: child.scale.x, y: child.scale.y, z: child.scale.z };
            json.children.push(object);
        }
        return json;
    }

    saveLevel = function(a) {
        a.storage.updateLevelToStorage(this.key, this.exportToJSON(a));
    }

    importFromJSON = function(levelData, a) {
        this.name = levelData.name;
        this.key = levelData.key;

        for (var i = 0; i < levelData.children.length; i++) {
            var child = levelData.children[i];
            var object = new Cube();
            if (child.class == 'player') object = a.player;
            object.setPosition(child.position.x, child.position.y, child.position.z);
            object.setScale(child.scale.x, child.scale.y, child.scale.z);
            object.setRotation(child.rotation.z);
            object.setStatic(child.isStatic);
            object.setColor(child.color);
            this.addObject(object, a);
        }
    } 
}