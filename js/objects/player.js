class Player extends Cube {
    constructor(options = {}) {
        super(options);
        this.body.class = 'player';

        // Update body
        this.setScale({ x: 16, y: 16, z: 16 });
        this.setStatic(false);
        this.setColors('#dc265a');
        this.mass = 5;
        this.allowJump = true;
    }

    jump() {
        if (this.allowJump == true) {
            this.allowJump = false;
            var xForce = 0;
            var yForce = -0.025 * this.body.mass; // Scale force by mass
            var direction = this.body.velocity.x >= 0 ? 1 : -1;
            var angularVelocity = (Math.PI / 20) * direction;
            Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: 0 });
            Matter.Body.setAngularVelocity(this.body, angularVelocity);
            Matter.Body.applyForce(this.body, this.body.position, { x: xForce, y: yForce });
        }
    }

    kill() {
        if (this.isFrozen() == false) {
            this.freeze(true);
            this.visible = false;
            var rows = 4, cols = 4, layers = 4;
            var scale = { x: this.scale.x / cols, y: this.scale.y / rows, z: this.scale.z / layers }
            setTimeout(this.respawn, 1000); // Respawn in 1 second
            for (var row = -rows / 2; row < rows / 2; row++) {
                for (var col = -cols / 2; col < cols / 2; col++) {
                    var randAngle = randomNumber(0, 360 * (Math.PI / 180));
                    var particleData = {
                        color: this.color,
                        position: { 
                            x: this.position.x + (col * scale.x) + (scale.x / 2),
                            y: this.position.y + (row * scale.y) + (scale.y / 2), 
                            z: 0
                        },
                        rotation: { x: 0, y: 0, z: randAngle },
                        scale: { x: scale.x, y: scale.y, z: scale.z }
                    };
                    var particle = app.newObject('cube');
                    app.level.setObjectProperties(particle, particleData);
                    app.level.addObject(particle, app);
                    particle.isParticle = true;
                    particle.body.isStatic = false;
                    particle.setColors(this.color);
                    Matter.Body.setVelocity(particle.body, this.body.velocity);
                }
            }
        }
    }

    saveCheckpoint(position) {
        if (this.checkpoint == null) this.checkpoint = {};
        this.checkpoint.x = position.x;
        this.checkpoint.y = position.y;
        this.checkpoint.z = position.z;
    }

    removeCheckpoint() {
        this.checkpoint = null;
    }

    setPositionToCheckpoint() {
        if (this.checkpoint != null) {
            this.setPosition({
                x: this.position.x = this.checkpoint.x,
                y: this.position.y = this.checkpoint.y,
                z: this.position.z = this.checkpoint.z
            }, false);
        }
    }

    respawn() {
        if (app.player.isFrozen() == true) {
            app.level.removeParticles(app);
            app.player.resetToOrigin();
            app.player.setPositionToCheckpoint();
        }
    }

    finish() {
        app.play = false;
        app.ui.addDialog({
            text: 'Finished!',
            inputs: [
                { attributes: { value: 'Retry', type: 'button' }, function: app.level.retryLevel, parameter: app },
                { attributes: { value: 'Continue', type: 'button' }, function: app.level.exitLevel, parameter: app }
            ]
        });
    }

    shrink() {
        this.setScale({ 
            x: this.scale.x / 2, 
            y: this.scale.y / 2, 
            z: this.scale.z / 2 
        }, false);
    }

    grow() {
        this.setScale({ 
            x: this.scale.x * 2, 
            y: this.scale.y * 2, 
            z: this.scale.z * 2 
        }, false);
    }
}