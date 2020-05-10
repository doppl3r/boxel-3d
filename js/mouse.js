class Mouse {
    constructor() {
        this.down = new THREE.Vector3();
        this.move = new THREE.Vector3();
        this.offset = new THREE.Vector3();
        this.up = new THREE.Vector3();
        this.tolerance = 5;
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

    setOffset = function(position) {
        this.offset.x = position.x - this.down.x;
        this.offset.y = position.y - this.down.y;
        this.offset.z = position.z - this.down.z;
    }

    getDragDifference = function() {
        return { 
            x: this.down.x - this.move.x - this.offset.x, 
            y: this.down.y - this.move.y - this.offset.y, 
            z: this.down.z - this.move.z - this.offset.z
        }
    }

    getTolerance = function() {
        var diff = this.getDragDifference();
        return (Math.abs(diff.x + this.offset.x) + Math.abs(diff.y + this.offset.y) > this.tolerance);
    }

    snap = function(value, step) {
        return Math.round(value / step) * step;
    }
}