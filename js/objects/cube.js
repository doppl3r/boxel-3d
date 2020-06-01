class Cube extends THREE.Mesh {
    constructor(options = {}) {
        super();

        // Update null values
        options.x = (options.x == null) ? 0 : options.x;
        options.y = (options.y == null) ? 0 : options.y;
        options.z = (options.z == null) ? 0 : options.z;
        options.scaleX = (options.scaleX == null) ? 1 : options.scaleX;
        options.scaleY = (options.scaleY == null) ? 1 : options.scaleY;
        options.scaleZ = (options.scaleZ == null) ? 1 : options.scaleZ;
        options.angle = (options.angle == null) ? 0 : options.angle;
        options.color = (options.color == null) ? '#620460' : options.color;

        // Set default properties
        this.shapes = new Shapes();
        this.shapes.addCube();
        this.shapes.setColors(options.color);
        this.add(this.shapes);
        this.hitbox = Matter.Bodies.rectangle(0, 0, options.scaleX, options.scaleY, { class: 'hitbox' });
        this.body = Matter.Body.create({
            parts: [this.hitbox],
            friction: 0.0,
            frictionAir: 0.0,
            frictionStatic: 0.0,
            restitution: 0.0,
            density: 0.001,
            name: this.uuid, // Useful for finding scene object
            class: 'cube'
        });
        this.name = this.uuid;
        this.castShadow = true;
        this.receiveShadow = true;
        this.setPosition(options.x, options.y, options.z);
        this.setRotation(options.angle);
        this.setScale(options.scaleX, options.scaleY, options.scaleZ);
    }

    setPosition(x, y, z, updateOrigin = true) {
        // Set null values
        x = (x == null) ? this.position.x : x;
        y = (y == null) ? this.position.y : y;
        z = (z == null) ? this.position.z : z;

        // Update position
        this.position.set(x, y, z);
        Matter.Body.setPosition(this.body, { x: x, y: -y });
        if (updateOrigin == true) this.setPositionOrigin(x, y, z);
    }

    setPositionOrigin(x, y, z) {
        this.xOrigin = x;
        this.yOrigin = y;
        this.zOrigin = z;
    }

    setRotation(angle, updateOrigin = true) {
        this.rotation.z = angle;
        Matter.Body.setAngle(this.body, -angle);
        if (updateOrigin == true) this.setRotationOrigin(angle);
    }

    setRotationOrigin(angle) {
        this.rotationOrigin = angle;
    }

    getRotation(format = 'radians') {
        var value = this.rotation.z; // Default radians
        if (format == 'degrees') value = Math.round(this.rotation.z * (180 / Math.PI));
        return value;
    }

    setScale(scaleX, scaleY, scaleZ, updateOrigin = true) {
        // Resolve null values
        scaleX = (scaleX == null) ? this.scale.x : scaleX;
        scaleY = (scaleY == null) ? this.scale.y : scaleY;
        scaleZ = (scaleZ == null) ? this.scale.z : scaleZ;
        
        // Temporarily set rectangle angle to zero to prevent skewing
        var tempAngle = this.rotation.z;
        this.setRotation(0);

        // Scale rectangle by previous scale, then update mesh scale ratio
        Matter.Body.scale(this.body, scaleX / this.scale.x, scaleY / this.scale.y);
        this.scale.x = scaleX;
        this.scale.y = scaleY;
        this.scale.z = scaleZ;
        this.setRotation(tempAngle); // Revert angle
        if (updateOrigin == true) this.setScaleOrigin(scaleX, scaleY, scaleZ);
    }

    setScaleOrigin(scaleX, scaleY, scaleZ) {
        this.scaleXOrigin = scaleX;
        this.scaleYOrigin = scaleY;
        this.scaleZOrigin = scaleZ;
    }

    resetToOrigin() {
        this.setPosition(this.xOrigin, this.yOrigin, this.ZOrigin, false);
        this.setRotation(this.rotationOrigin, false);
        this.setScale(this.scaleXOrigin, this.scaleYOrigin, this.scaleZOrigin, false);
        this.setStatic(this.isStaticOrigin, false);
        Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(this.body, 0);
    }

    setStatic(isStatic, updateOrigin = true) {
        Matter.Body.setStatic(this.body, isStatic);
        if (updateOrigin == true) this.setStaticOrigin(isStatic);
    }

    setStaticOrigin(isStatic) {
        this.isStaticOrigin = isStatic;
    }

    toggleStatic() {
        var isStatic = !this.body.isStatic;
        this.setStatic(isStatic);
        return isStatic;
    }

    isStatic() {
        return this.body.isStatic;
    }

    getClass() {
        return this.body.class;
    }

    setText(text) {
        if (text != null) this.text = text;
    }

    getText() { return this.text; }

    select(state = true) {
        this.selected = state;
        if (state == true) {
            this.shapes.setColors('#ffffff', false);
            this.shapes.setOpacities(0.9);
            Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(this.body, 0);
        }
        else {
            this.shapes.resetColors();
            this.shapes.setOpacities(1);
        }
    }

    force(force, object, relativeAngle = false) {
        // Vector of this cube
        var x1 = this.body.positionPrev.x;
        var x2 = this.body.position.x;
        var y1 = this.body.positionPrev.y;
        var y2 = this.body.position.y;
        var angleA = object.body.angle; // Ex: object angle
        var angleB = Math.atan2(y2 - y1, x2 - x1); // Ex: this angle

        // Use relative angle, not object angle
        if (relativeAngle == true) {
            angleA = this.body.angle;
            angleB = this.body.angle + (Math.PI / 2);
            force *= -1; // Newtons 3rd law of pizza
        }

        // Normalize velocity
        var vx = Math.cos(angleB);
        var vy = Math.sin(angleB);

        // Set surface direction
        var nx = -Math.sin(angleA);
        var ny = Math.cos(angleA);

        // Get dot value to calculate reflection
        var dot = (vx * nx) + (vy * ny);

        // Update velocity direction after reflection transforms
        var vnewx = vx - (2 * dot * nx);
        var vnewy = vy - (2 * dot * ny);

        // Reverse force if dot product is negative
        if (dot < 0 && (Math.abs(vnewx) == 1 || Math.abs(vnewy) == 1)) { force *= -1; console.log(vnewx, vnewy); }

        Matter.Body.setVelocity(this.body, { 
            x: vnewx * force,
            y: vnewy * force
        });
        return force;
    }

    getVelocity(object = this) {
        console.log(object);
        return { 
            x: object.body.position.x - object.body.positionPrev.x,
            y: object.body.position.y - object.body.positionPrev.y
        }
    }
}