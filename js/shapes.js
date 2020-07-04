class Shapes extends THREE.Group {
    constructor() {
        super();
    }

    addCube(options = {}) {
        options.x = (options.x == null) ? 0 : options.x;
        options.y = (options.y == null) ? 0 : options.y;
        options.z = (options.z == null) ? 0 : options.z;
        options.scaleX = (options.scaleX == null) ? 1 : options.scaleX;
        options.scaleY = (options.scaleY == null) ? 1 : options.scaleY;
        options.scaleZ = (options.scaleZ == null) ? 1 : options.scaleZ;
        options.color = (options.color == null) ? '#620460' : options.color;
        options.opacity = (options.opacity == null) ? 1 : options.opacity;

        var geometry = new THREE.BoxGeometry(options.scaleX, options.scaleY, options.scaleZ);
        var material = new THREE.MeshPhongMaterial({ color: options.color, transparent: true });
        var cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.position.set(options.x, options.y, options.z);
        cube.material.colorOrigin = options.color;
        cube.material.opacity = options.opacity;
        this.add(cube);
    }
    
    addCone(options = {}) {
        options.x = (options.x == null) ? 0 : options.x;
        options.y = (options.y == null) ? 0 : options.y;
        options.z = (options.z == null) ? 0 : options.z;
        options.scaleX = (options.scaleX == null) ? 1 : options.scaleX;
        options.scaleY = (options.scaleY == null) ? 1 : options.scaleY;
        options.scaleZ = (options.scaleZ == null) ? 1 : options.scaleZ;
        options.segments = (options.segments == null) ? 4 : options.segments;
        options.color = (options.color == null) ? '#620460' : options.color;
        options.opacity = (options.opacity == null) ? 1 : options.opacity;

        var geometry = new THREE.ConeGeometry((options.scaleX / 2) * 1.5, options.scaleY, options.segments);
        var material = new THREE.MeshPhongMaterial({ color: options.color });
        var cone = new THREE.Mesh(geometry, material);
        cone.castShadow = true;
        cone.receiveShadow = true;
        cone.position.set(options.x, options.y, options.z);
        cone.material.colorOrigin = options.color;
        cone.material.opacity = options.opacity;
        cone.rotation.y = (45 * Math.PI / 180); // Rotate Cone
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

    setOpacities(opacity) {
        var length = this.children.length;
        for (var i = 0; i < length; i++) {
            var child = this.children[i];
            child.material.opacity = opacity;
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