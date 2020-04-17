class Cube extends THREE.Mesh {
    constructor() {
        super();
        this.width = 1;
        this.height = 1;
        this.length = 1;
        this.material = new THREE.MeshPhongMaterial({ color: '#dc265a' });
        this.geometry = new THREE.BoxGeometry(this.width, this.height, this.length);
        this.rectangle = Matter.Bodies.rectangle(0, 0, this.width, this.height, { friction: 0.001, frictionAir: 0.01, restitution: 0.5, density: 0.001, slop: 0.05 });
        this.castShadow = true;
        this.receiveShadow = true;
        this.resetPosition();
    }

    resetPosition = function() {
        this.setPosition(0, 0, 0);
    }

    setPosition = function(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        Matter.Body.setPosition(this.rectangle, { x: x, y: y });
    }

    setColor = function(color) {
        this.material.color.set(color);
    }

    setStatic = function(isStatic) {
        Body.setStatic(this.rectangle, isStatic);
    }

    setScale = function(scaleX, scaleY, scaleZ) {
        this.scale.set(scaleX, scaleY, scaleZ);
        Matter.Body.scale(this.rectangle, scaleX, scaleY);
    }
}