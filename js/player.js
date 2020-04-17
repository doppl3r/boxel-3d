class Player extends THREE.Mesh {
    constructor() {
        super();
        this.material = new THREE.MeshPhongMaterial({ color: 0xdc265a });
        this.geometry = new THREE.BoxGeometry(16, 16, 16);
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.cube.castShadow = true;
        this.cube.receiveShadow = true;
        this.resetPosition();
    }

    resetPosition = function() {
        this.setPosition(0, -1, 0);
    }

    setPosition = function(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }
}