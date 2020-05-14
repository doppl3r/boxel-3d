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
        Matter.World.remove(a.engine.world, object.rectangle);
        this.remove(object);
        a.deselectScene(a);
        a.ui.showObjectOptions(false);
    }

    removeAllObjects = function(a) {
        var length = a.level.children.length;
        for (var i=0; i < length; i++) {
            var child = a.level.children[0];
            this.removeObject(child, a);
        }
    }

    exportToJSON = function(a) {
        var json = {}
        json.name = this.name;
        json.objects = [];
        for (var i = 0; i < a.level.children.length; i++) {
            var object = {}
            var child = a.level.children[i];
            object.position = { x: child.position.x, y: child.position.y, z: child.position.z };
            object.rotation = { x: child.rotation.x, y: child.rotation.y, z: child.rotation.z };
            object.scale = { x: child.scale.x, y: child.scale.y, z: child.scale.z };
            json.objects.push(object);
        }
        return json;
    }

    saveLevel = function(a) {
        console.log(this.exportToJSON(a));
    }

    importFromJSON = function() {

    } 
}