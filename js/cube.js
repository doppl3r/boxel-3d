class Cube extends THREE.Mesh {
    constructor() {
        super();
        this.width = 16;
        this.height = 16;
        this.length = 16;
        this.material = new THREE.MeshPhongMaterial({ color: 0xdc265a });
        this.geometry = new THREE.BoxGeometry(this.width, this.height, this.length);
        this.body = Matter.Bodies.rectangle(0, 0, this.width, this.height, { friction: 0.001, frictionAir: 0.01, restitution: 0.5, density: 0.001, slop: 0.05 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.resetPosition();
    }

    resetPosition = function() {
        this.setPosition(0, 0, 0);
    }

    setPosition = function(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }
}