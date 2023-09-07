import { Raycaster, Vector3 } from 'three';

class Mouse {
    constructor() {
        this.down = new Vector3();
        this.move = new Vector3();
        this.offset = new Vector3();
        this.up = new Vector3();
        this.drag = false;
        this.mode = 'draw';
        this.snap = 1; // Drag snapping
        this.prevMode = this.mode;
    }
    
    mouseDown(e, a) {
        this.setTolerance();
        if (a.play == false) { a.levelEditor.mouseDown(e, a); }
        else {
            var position = a.mouse.getPosition(e, a);
            a.player.jump(position);
            a.player.addRope(position);
        }
    }

    mouseMove(e, a) {
        if (a.play == false) { a.levelEditor.mouseMove(e, a); }
    }

    mouseUp(e, a) {
        if (a.play == false) { a.levelEditor.mouseUp(e, a); }
        a.player.removeRope(); // Always remove rope
    }

    getPosition(e, a) {
        var raycaster = new Raycaster();
        var pos = new Vector3(); // create once and reuse
        var intersects = [];

        // Check intersection with player "plane" for rope collision
        raycaster.setFromCamera(a.mouse.getMouse(e, a), a.camera);
        intersects = raycaster.intersectObject(a.player, true);

        // Copy and return position
        if (intersects.length > 0) pos.copy(intersects[0].point);
        return(pos);
    }

    clickObject(e, a) {
        var raycaster = new Raycaster();
        var vec = new Vector3();
        var object;
        var x = (e.clientX / a.window.innerWidth) * 2 - 1;
        var y = -(e.clientY / a.window.innerHeight) * 2 + 1;
        vec.set(x, y, 0);
        raycaster.setFromCamera(vec, a.camera);
        var intersects = raycaster.intersectObjects(a.scene.children, true);
        if (intersects.length > 0) {
            // Parent #1 = Shapes, Parent #2 = Cube
            object = intersects[0].object.parent.parent;
        }
        return(object);
    }

    wheel(e, a) {
        e.preventDefault();
        if (app.ui.state == 'level-editor') {
            var zoom = a.camera.position.z + e.deltaY;
            if (zoom < 100) zoom = 100;
            else if (zoom > 1000) zoom = 1000;
            a.camera.position.z = zoom;
            a.mouse.setTolerance();
        }
    }

    setTolerance(value = 0.05) {
        this.tolerance = app.camera.position.z * value;
    }

    setPosition(state, position) {
        if (state == 'down') {
            this.down = position;
            this.move = position; // Reset move
            this.drag = true;
        }
        else if (state == 'move') {
            if (this.drag == true) this.move = position;
        }
        else if (state == 'up') {
            this.up = position;
            this.drag = false;
        }
    }

    setOffset(position) {
        this.offset.x = position.x - this.down.x;
        this.offset.y = position.y - this.down.y;
        this.offset.z = position.z - this.down.z;
    }

    getDragDifference() {
        return { 
            x: Math.round(this.down.x - this.move.x - this.offset.x), 
            y: Math.round(this.down.y - this.move.y - this.offset.y), 
            z: Math.round(this.down.z - this.move.z - this.offset.z)
        }
    }

    getTolerance() {
        var diff = this.getDragDifference();
        return (Math.abs(diff.x + this.offset.x) + Math.abs(diff.y + this.offset.y) > this.tolerance);
    }

    snapToValue(value, step) {
        return Math.round(value / step) * step;
    }
    
    setSnap(snap) {
        this.snap = snap;
    }

    setMode(mode) {
        this.mode = this.prevMode =  mode;
    }

    getMode() {
        return this.mode;
    }

    getMouse(e, a) {
		return {
            x: (e.clientX / a.window.innerWidth) * 2 - 1,
            y: -(e.clientY / a.window.innerHeight) * 2 + 1,
            z: 0.5
        };
	}
}

export { Mouse };