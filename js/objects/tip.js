class Tip extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'tip';
        this.setScale(16, 16, 16);
        this.shapes.removeAllShapes();
        this.addShapes(options);
    }

    addShapes(options) {
        var u = (options.scaleZ * 0.2); // unit size
        this.shapes.addCube({ color: '#0287ef' });
        this.shapes.addCube({ y: (u * 1), z: (u * 3), scaleX: u, scaleY: (u * 2), scaleZ: u, color: '#fff' });
        this.shapes.addCube({ y: -(u * 1.5), z: (u * 3), scaleX: u, scaleY: u, scaleZ: u, color: '#fff' });
    }
}