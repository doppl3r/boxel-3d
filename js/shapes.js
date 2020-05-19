class Shapes extends THREE.Group {
    constructor() {
        super();
    }

    addCube(options) {
        var geometry = new THREE.BoxGeometry(options.scaleX, options.scaleY, options.scaleZ);
        var material = new THREE.MeshPhongMaterial({ color: this.color, originalColor: this.color });
        var cube = new THREE.Mesh(geometry, material);
        this.add(cube);
    }

    addCone(options) {
        var geometry = new THREE.ConeGeometry(options.radius, options.height, options.segments);
        var material = new THREE.MeshBasicMaterial({ color: options.color, originalColor: this.color });
        var cone = new THREE.Mesh(geometry, material);
        this.add(cone);
    }
}