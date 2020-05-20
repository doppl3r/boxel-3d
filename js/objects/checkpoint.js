class Checkpoint extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'checkpoint';
        this.setScale(16, 16, 16);
        this.shapes.removeAllShapes();
        this.addShapes(options);
    }

    addShapes(options) {
        var u = (options.scaleZ * 0.2); // unit size
        this.shapes.addCube({ scaleX: u, scaleY: u, scaleZ: u, color: '#fff' });
        this.shapes.addCube({ x: (u * 0), y: -(u * 2), z: (u * 2), scaleX: (u * 5), scaleY: (u * 1), scaleZ: (u * 1), color: '#0287ef' });
        this.shapes.addCube({ x: (u * 0), y: -(u * 2), z: -(u * 2), scaleX: (u * 5), scaleY: (u * 1), scaleZ: (u * 1), color: '#0287ef' });
        this.shapes.addCube({ x: (u * 0), y: (u * 2), z: (u * 2), scaleX: (u * 5), scaleY: (u * 1), scaleZ: (u * 1), color: '#0287ef' });
        this.shapes.addCube({ x: (u * 0), y: (u * 2), z: -(u * 2), scaleX: (u * 5), scaleY: (u * 1), scaleZ: (u * 1), color: '#0287ef' });
        this.shapes.addCube({ x: -(u * 2), y: -(u * 2), z: 0, scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 5), color: '#0287ef' });
        this.shapes.addCube({ x: -(u * 2), y: (u * 2), z: 0, scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 5), color: '#0287ef' });
        this.shapes.addCube({ x: (u * 2), y: -(u * 2), z: 0, scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 5), color: '#0287ef' });
        this.shapes.addCube({ x: (u * 2), y: (u * 2), z: 0, scaleX: (u * 1), scaleY: (u * 1), scaleZ: (u * 5), color: '#0287ef' });
        this.shapes.addCube({ x: (u * 2), y: 0, z: (u * 2), scaleX: (u * 1), scaleY: (u * 5), scaleZ: (u * 1), color: '#0287ef' });
        this.shapes.addCube({ x: (u * 2), y: 0, z: -(u * 2), scaleX: (u * 1), scaleY: (u * 5), scaleZ: (u * 1), color: '#0287ef' });
        this.shapes.addCube({ x: -(u * 2), y: 0, z: (u * 2), scaleX: (u * 1), scaleY: (u * 5), scaleZ: (u * 1), color: '#0287ef' });
        this.shapes.addCube({ x: -(u * 2), y: 0, z: -(u * 2), scaleX: (u * 1), scaleY: (u * 5), scaleZ: (u * 1), color: '#0287ef' });
    }
}