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
        this.geometry = new THREE.BoxGeometry(options.scaleX, options.scaleY, options.scaleZ);
        this.material = new THREE.MeshPhongMaterial({ color: '#fff' });
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
        this.setRotation(options.angle);
        this.setScale(options.scaleX, options.scaleY, options.scaleZ);
    }

    setPosition = function(x, y, z, updateOrigin = true) {
        this.position.set(x, y, z);
        Matter.Body.setPosition(this.rectangle, { x: x, y: -y });
        if (updateOrigin == true) this.setPositionOrigin(x, y, z);
    }

    setPositionOrigin = function(x, y, z) {
        this.xOrigin = x;
        this.yOrigin = y;
        this.zOrigin = z;
    }

    setRotation = function(angle, updateOrigin = true) {
        this.rotation.z = angle;
        Matter.Body.setAngle(this.rectangle, -angle);
        if (updateOrigin == true) this.setRotationOrigin(angle);
    }

    setRotationOrigin = function(angle) {
        this.rotationOrigin = angle;
    }

    setScale = function(scaleX, scaleY, scaleZ, updateOrigin = true) {
        // Temporarily set rectangle angle to zero to prevent skewing
        var tempAngle = this.rotation.z;
        this.setRotation(0);

        // Scale rectangle by previous scale, then update mesh scale ratio
        Matter.Body.scale(this.rectangle, scaleX / this.scale.x, scaleY / this.scale.y);
        this.scale.x = scaleX;
        this.scale.y = scaleY;
        this.scale.z = scaleZ;
        this.setRotation(tempAngle); // Revert angle
        if (updateOrigin == true) this.setScaleOrigin(scaleX, scaleY, scaleZ);
    }

    setScaleOrigin = function(scaleX, scaleY, scaleZ) {
        this.scaleXOrigin = scaleX;
        this.scaleYOrigin = scaleY;
        this.scaleZOrigin = scaleZ;
    }

    resetToOrigin = function() {
        this.setPosition(this.xOrigin, this.yOrigin, this.ZOrigin, false);
        this.setRotation(this.rotationOrigin, false);
        this.setScale(this.scaleXOrigin, this.scaleYOrigin, this.scaleZOrigin, false);
        this.setStatic(this.isStaticOrigin, false);
        Matter.Body.setVelocity(this.rectangle, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(this.rectangle, 0);
    }

    setColor = function(color, updateOrigin = true) {
        this.material.color.set(color);
        if (updateOrigin == true) this.setColorOrigin(color);
    }

    setColorOrigin = function(color) {
        this.colorOrigin = color;
    }

    setStatic = function(isStatic, updateOrigin = true) {
        Matter.Body.setStatic(this.rectangle, isStatic);
        if (updateOrigin == true) this.setStaticOrigin(isStatic);
    }

    setStaticOrigin = function(isStatic) {
        this.isStaticOrigin = isStatic;
    }

    toggleStatic = function() {
        var isStatic = !this.rectangle.isStatic;
        this.setStatic(isStatic);
        return isStatic;
    }

    isStatic = function() {
        return this.rectangle.isStatic;
    }

    select = function(state = true) {
        this.selected = state;
        this.setColor(this.selected ? '#ffffff' : this.colorOrigin, false);
    }

    toggleSelected = function() {
        this.selected = !this.selected;
        this.setColor(this.selected ? '#ffffff' : this.colorOrigin, false);
        return this.selected;
    }
}