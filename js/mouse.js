class Mouse {
    constructor() {
        this.down = new THREE.Vector3();
        this.move = new THREE.Vector3();
        this.up = new THREE.Vector3();
        this.drag = false;
    }
    
    mouseDown = function(position) {
        this.down = position;
        this.move = position; // Reset move
        this.drag = true;
    }

    mouseMove = function(position) {
        if (this.drag == true) this.move = position;
    }

    mouseUp = function(position) {
        this.up = position;
        this.drag = false;
    }

    getDragDifference = function() {
        return { 
            x: this.down.x - this.move.x, 
            y: this.down.y - this.move.y, 
            z: this.down.z - this.move.z
        }
    }
}