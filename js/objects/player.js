class Player extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'player';

        // Set sensor to the bottom
        Matter.Body.setParts(this.body, [this.rectangle]); // Removed sensor

        // Update body
        this.setScale(16, 16, 16);
        this.setStatic(false);
        this.shapes.setColors('#dc265a');
        this.mass = 5;
        this.jumpForce = -0.00125 * this.mass;
        this.allowJump = true;
    }

    jump() {
        if (this.allowJump == true) {
            this.allowJump = false;
            var xForce = 0;
            var yForce = this.jumpForce;
            Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
            Matter.Body.applyForce(this.body, this.body.position, { x: xForce, y: yForce });
        }
    }
}