class Player extends THREE.Mesh {
    constructor() {
        super();
        this.geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        this.material = new THREE.MeshBasicMaterial({ color: 0xdc265a });
        this.cube = new THREE.Mesh(this.geometry, this.material);
        this.resetPosition();
    }

    resetPosition = function() {
        this.position.x = 0;
        this.position.y = -1;
    }
}