class Cube extends THREE.Mesh {
    constructor() {
        super();
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
            density: 0.0
        });
        this.castShadow = true;
        this.receiveShadow = true;
        this.resetPosition();
    }

    resetPosition = function() {
        this.setPosition(0, 0, 0);
    }

    setPosition = function(x, y, z) {
        this.position.set(x, y, z);
        Matter.Body.setPosition(this.rectangle, { x: x, y: -y });
    }

    setRotation = function(angle) {
        Matter.Body.rotate(this.rectangle, angle);
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
}