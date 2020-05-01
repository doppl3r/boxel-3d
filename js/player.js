class Player extends Cube {
    constructor() {
        super();
        this.setColor('#dc265a');
        this.scaleCube(16, 16, 16);
        this.mass = 5;
        this.jumpForce = -0.00125 * this.mass;
    }

    jump = function() {
        var radian = -(Math.PI / 180) * 360;
        var angle = this.rotation.z;
        //var xForce = Math.sin(angle) * this.jumpForce;
        //var yForce = Math.cos(angle) * this.jumpForce;
        var xForce = 0;
        var yForce = this.jumpForce;
        Matter.Body.setVelocity(this.rectangle, { x: this.rectangle.velocity.x, y: 0 });
        Matter.Body.applyForce(this.rectangle, this.rectangle.position, { x: xForce, y: yForce });
    }
}