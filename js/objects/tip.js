class Tip extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'tip';
        
        // Set sensor to the bottom
        this.sensor = Matter.Bodies.rectangle(0, 0.6, options.scaleX * 0.6, options.scaleY * 0.2, { isSensor: true, density: 0, class: 'sensor' });
        Matter.Body.setParts(this.body, [this.rectangle, this.sensor]);
        
        // Update body properties
        this.setScale(16, 16, 16);
        this.shapes.removeAllShapes();
        this.addShapes(options);
    }

    addShapes(options) {
        var u = (options.scaleZ * 0.2); // unit size
        this.shapes.addCube({ color: '#0287ef', z: -(u * 0.5), scaleZ: (u * 4) });
        this.shapes.addCube({ y: (u * 1), z: (u * 2), scaleX: u, scaleY: (u * 2), scaleZ: u, color: '#fff' });
        this.shapes.addCube({ y: -(u * 1.5), z: (u * 2), scaleX: u, scaleY: u, scaleZ: u, color: '#fff' });
    }
}