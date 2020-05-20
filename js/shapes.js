class Shapes extends THREE.Group {
    constructor() {
        super();
    }

    addCube(options) {
        var geometry = new THREE.BoxGeometry(options.scaleX, options.scaleY, options.scaleZ);
        var material = new THREE.MeshPhongMaterial({ color: options.color, colorOrigin: options.color });
        var cube = new THREE.Mesh(geometry, material);
        this.add(cube);
    }

    addCone(options) {
        var geometry = new THREE.ConeGeometry(options.radius, options.height, options.segments);
        var material = new THREE.MeshBasicMaterial({ color: options.color, colorOrigin: this.color });
        var cone = new THREE.Mesh(geometry, material);
        this.add(cone);
    }

    setColors(color, updateOrigin = true) {
        var length = this.children.length;
        for (var i = 0; i < length; i++) {
            var child = this.children[i];
            child.material.color.set(color);
            if (updateOrigin == true) child.material.colorOrigin = color;
        }
    }

    resetColors() {
        var length = this.children.length;
        for (var i = 0; i < length; i++) {
            var child = this.children[i];
            var colorOrigin = child.material.colorOrigin;
            child.material.color.set(colorOrigin);
        }
    }

    removeAllShapes() {
        var length = this.children.length;
        for (var i = 0; i < length; i++) {
            var child = this.children[0];
            this.remove(child);
        }
    }
}