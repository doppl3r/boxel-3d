class Cube extends THREE.Mesh {
    constructor(x, y, z, angle) {
        super();
        x = (x == null) ? 0 : x;
        y = (y == null) ? 0 : y;
        z = (z == null) ? 0 : z;
        angle = (angle == null) ? 0 : angle;
        this.width = 1;
        this.height = 1;
        this.length = 1;
        this.material = new THREE.MeshPhongMaterial({ color: '#fff' });
        this.geometry = new THREE.BoxGeometry(this.width, this.height, this.length);
        this.rectangle = Matter.Bodies.rectangle(0, 0, this.width, this.height, { 
            friction: 0.0,
            frictionAir: 0.0,
            frictionStatic: 0.0,
            restitution: 0.0,
            density: 0.001
        });
        this.name = this.uuid;
        this.castShadow = true;
        this.receiveShadow = true;
        this.setPosition(x, y, z); // Default center of scene
        this.setRotation(angle);
    }

    resetToOrigin = function() {
        this.setPosition(this.xOrigin, this.yOrigin, this.ZOrigin);
        Matter.Body.setPosition(this.rectangle, { x: this.xOrigin, y: -this.yOrigin });
        Matter.Body.setVelocity(this.rectangle, { x: 0, y: 0 });
        Matter.Body.setAngle(this.rectangle, 0);
        Matter.Body.setAngularVelocity(this.rectangle, 0);
    }

    setPosition = function(x, y, z) {
        if (this.xOrigin == null || this.yOrigin == null || this.zOrigin == null){
            this.setOriginPosition(x, y, z);
        }
        this.position.set(x, y, z);
        Matter.Body.setPosition(this.rectangle, { x: x, y: -y });
    }

    setOriginPosition = function(x, y, z) {
        this.xOrigin = x;
        this.yOrigin = y;
        this.zOrigin = z;
    }

    setRotation = function(angle) {
        if (this.angleOrigin == null) {
            this.setOriginRotation(angle);
        }
        Matter.Body.rotate(this.rectangle, angle);
    }

    setOriginRotation = function(angle) {
        this.rotationOrigin = angle;
    }

    setColor = function(color) {
        this.material.color.set(color);
    }

    setStatic = function(isStatic) {
        Matter.Body.setStatic(this.rectangle, isStatic);
    }

    scaleCube = function(scaleX, scaleY, scaleZ) {
        this.scale.x *= scaleX;
        this.scale.y *= scaleY;
        this.scale.z *= scaleZ;
        Matter.Body.scale(this.rectangle, scaleX, scaleY);
    }

    remove = function() {
        scene.remove(this);
        Matter.World.remove(engine.world, this.rectangle);
    }
}