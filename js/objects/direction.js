class Direction extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'direction';
        
        // Update body properties
        this.setScale({ x: 16, y: 16, z: 16 });
        this.shapes.removeAllShapes();
        this.addShapes(options);
    }

    addShapes(options) {
        var u = (options.scaleZ * 0.2); // unit size
        this.shapes.addCube({ x: 0, y: 0, z: -(u * 0.5), scaleX: 1, scaleY: 1, scaleZ: (u * 4), color: '#0287ef' }); // Blue Box
        this.shapes.addExtrusion({
            position: { x: -0.5, y: -0.5, z: (u * 1.5) },
            points: [{ x: u, y: u }, { x: u * 4, y: 0.5 }, { x: u, y: u * 4 }],
            depth: u,
            color: '#fff'
        });
    }
}