class Player extends Cube {
    constructor() {
        super();
        this.setColor('#dc265a');
        this.rectangle = Matter.Bodies.rectangle(0, 0, this.width, this.height, { 
            friction: 0.0,
            frictionAir: 0.0125,
            frictionStatic: 0.0,
            restitution: 0.0,
            density: 0.001
        });
        this.scaleCube(16, 16, 16);
        this.mass = 5;
        this.jumpForce = -0.00125 * this.mass;
    }

    jump = function() {
        //Matter.Body.setAngularVelocity(this.rectangle, this.rectangle.velocity.x / 10);
        Matter.Body.setVelocity(this.rectangle, { x: this.rectangle.velocity.x, y: 0 });
        Matter.Body.applyForce(this.rectangle, this.rectangle.position, { x: 0, y: this.jumpForce });
        //this.rectangle.force.y = this.jumpForce / delta;
    }
}