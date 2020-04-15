class Player extends THREE.Mesh {
    constructor() {
        super();
        this.material = new THREE.MeshBasicMaterial({ color: 0xdc265a });
        this.geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.cube.castShadow = true;
        this.cube.receiveShadow = true;
        this.resetPosition();
    }

    resetPosition = function() {
        this.position.x = 0;
        this.position.y = -1;
    }
}