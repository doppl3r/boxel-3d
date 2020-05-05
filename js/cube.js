class Cube extends THREE.Mesh {
    constructor(options) {
        super();

        // Update null values
        options.x = (options.x == null) ? 0 : options.x;
        options.y = (options.y == null) ? 0 : options.y;
        options.z = (options.z == null) ? 0 : options.z;
        options.scaleX = (options.scaleX == null) ? 1 : options.scaleX;
        options.scaleY = (options.scaleY == null) ? 1 : options.scaleY;
        options.scaleZ = (options.scaleZ == null) ? 1 : options.scaleZ;
        options.angle = (options.angle == null) ? 0 : options.angle;
        
        // Set default properties
        this.material = new THREE.MeshPhongMaterial({ color: '#fff' });
        this.geometry = new THREE.BoxGeometry(options.scaleX, options.scaleY, this.length);
        this.rectangle = Matter.Bodies.rectangle(0, 0, options.scaleX, options.scaleY, { 
            friction: 0.0,
            frictionAir: 0.0,
            frictionStatic: 0.0,
            restitution: 0.0,
            density: 0.001
        });
        this.name = this.uuid;
        this.castShadow = true;
        this.receiveShadow = true;
        this.setPosition(options.x, options.y, options.z);
        this.setPositionOrigin(options.x, options.y, options.z);
        this.setRotation(options.angle);
        this.setRotationOrigin(options.angle);
        this.setScale(options.scaleX, options.scaleY, options.scaleZ);
        this.setScaleOrigin(options.scaleX, options.scaleY, options.scaleZ);
    }

    resetToOrigin = function() {
        this.setPosition(this.xOrigin, this.yOrigin, this.ZOrigin);
        Matter.Body.setPosition(this.rectangle, { x: this.xOrigin, y: -this.yOrigin });
        Matter.Body.setVelocity(this.rectangle, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(this.rectangle, 0);
        Matter.Body.setAngle(this.rectangle, this.rotationOrigin);
    }

    setPosition = function(x, y, z) {
        this.position.set(x, y, z);
        Matter.Body.setPosition(this.rectangle, { x: x, y: -y });
    }

    setPositionOrigin = function(x, y, z) {
        this.xOrigin = x;
        this.yOrigin = y;
        this.zOrigin = z;
    }

    setRotation = function(angle, updateCollision = true) {
        this.rotation.z = angle;
        if (updateCollision == true) Matter.Body.rotate(this.rectangle, -angle);
    }

    setRotationOrigin = function(angle) {
        this.rotationOrigin = angle;
    }

    setScale = function(scaleX, scaleY, scaleZ) {
        // Temporarily set rectangle angle to zero to prevent skewing
        var tempAngle = this.rotation.z;
        this.setRotation(-this.rotation.z);

        // Scale rectangle by previous scale, then update mesh scale ratio
        Matter.Body.scale(this.rectangle, scaleX / this.scale.x, scaleY / this.scale.y);
        this.scale.x = scaleX;
        this.scale.y = scaleY;
        this.scale.z = scaleZ;
        this.setRotation(tempAngle); // Revert angle
    }

    setScaleOrigin = function(scaleX, scaleY, scaleZ) {
        this.scaleXOrigin = scaleX;
        this.scaleYOrigin = scaleY;
        this.scaleZOrigin = scaleZ;
    }

    setColor = function(color) {
        this.material.color.set(color);
    }

    setStatic = function(isStatic) {
        Matter.Body.setStatic(this.rectangle, isStatic);
    }

    remove = function() {
        scene.remove(this);
        Matter.World.remove(engine.world, this.rectangle);
    }
}