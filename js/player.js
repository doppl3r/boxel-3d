class Player extends Cube {
    constructor() {
        super();
        this.setColor('#dc265a');
        this.rectangle = Matter.Bodies.rectangle(0, 0, this.width, this.height, { 
            friction: 0.0,
            frictionAir: 0.0,
            frictionStatic: 0.0,
            restitution: 0.0,
            density: 0.001,
        });
        this.scaleCube(16, 16, 16);
    }

    jump = function() {
        //Matter.Body.setAngularVelocity(this.rectangle, 0.1);
        this.rectangle.torque = 0.025;
        this.rectangle.force = { x: 0, y: -0.0065 };
    }
}