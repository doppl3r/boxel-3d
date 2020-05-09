class Mouse {
    constructor() {
        this.down = new THREE.Vector3();
        this.move = new THREE.Vector3();
        this.up = new THREE.Vector3();
    }
    
    mouseDown = function(position) {
        this.down = position;
    }

    mouseMove = function(position) {
        this.move = position;
    }

    mouseUp = function(position) {
        this.up = position;
    }
}