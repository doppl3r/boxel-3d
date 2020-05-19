class Player extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'player';
        this.setColor('#dc265a');
        this.setScale(16, 16, 16);
        this.setStatic(false);
        this.mass = 5;
        this.jumpForce = -0.00125 * this.mass;
        this.allowJump = true;
    }

    jump = function() {
        if (this.allowJump == true) {
            this.allowJump = false;
            var radian = -(Math.PI / 180) * 360;
            var angle = this.rotation.z;
            //var xForce = Math.sin(angle) * this.jumpForce;
            //var yForce = Math.cos(angle) * this.jumpForce;
            var xForce = 0;
            var yForce = this.jumpForce;
            Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
            Matter.Body.applyForce(this.body, this.body.position, { x: xForce, y: yForce });
        }
    }
}