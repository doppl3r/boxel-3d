class Shrink extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'shrink';
        this.setScale(16, 16, 16);
        this.shapes.removeAllShapes();
        this.addShapes(options);
    }

    addShapes(options) {
        var u = (options.scaleZ * 0.2); // unit size
        this.shapes.addCube({ x: -(u * 1), y: (u * 1), z: (u * 1), scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 1), color: '#dc265a' });
        this.shapes.addCube({ x: (u * 1), y: (u * 1), z: (u * 1), scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 1), color: '#dc265a' });
        this.shapes.addCube({ x: -(u * 1), y: -(u * 1), z: (u * 1), scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 1), color: '#dc265a' });
        this.shapes.addCube({ x: (u * 1), y: -(u * 1), z: (u * 1), scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 1), color: '#dc265a' });
        this.shapes.addCube({ x: -(u * 1), y: (u * 1), z: -(u * 1), scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 1), color: '#dc265a' });
        this.shapes.addCube({ x: (u * 1), y: (u * 1), z: -(u * 1), scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 1), color: '#dc265a' });
        this.shapes.addCube({ x: -(u * 1), y: -(u * 1), z: -(u * 1), scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 1), color: '#dc265a' });
        this.shapes.addCube({ x: (u * 1), y: -(u * 1), z: -(u * 1), scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 1), color: '#dc265a' });
    }
}