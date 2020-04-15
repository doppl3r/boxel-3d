class Player extends THREE.Mesh {
    constructor() {
        super();
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: 0xdc265a });
        this.cube = new THREE.Mesh(this.geometry, this.material);
    }
}