class Spike extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'spike';
        this.setScale(16, 16, 16);
        this.shapes.removeAllShapes();
        this.addShapes(options);
    }

    addShapes(options) {
        var u = (options.scaleZ * 0.25); // unit size
        this.shapes.addCone({ x: -(u * 1), y: (u * 0), z: (u * 1), scaleX: (u * 2), scaleY: (u * 4) });
        this.shapes.addCone({ x: -(u * 1), y: (u * 0), z: -(u * 1), scaleX: (u * 2), scaleY: (u * 4) });
        this.shapes.addCone({ x: (u * 1), y: (u * 0), z: (u * 1), scaleX: (u * 2), scaleY: (u * 4) });
        this.shapes.addCone({ x: (u * 1), y: (u * 0), z: -(u * 1), scaleX: (u * 2), scaleY: (u * 4) });
    }
}