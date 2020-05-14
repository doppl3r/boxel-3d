class Level extends THREE.Group {
    constructor() {
        super();
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
}