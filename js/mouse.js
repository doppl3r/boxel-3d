class Mouse {
    constructor() {
        this.down = new THREE.Vector3();
        this.move = new THREE.Vector3();
        this.offset = new THREE.Vector3();
        this.up = new THREE.Vector3();
        this.tolerance = 5;
        this.drag = false;
        this.moveCamera;
    }
    
    mouseDown = function(e, a) {
        if (a.play == false) {
            var target = a.getObject(e, a);
            a.mouse.setPosition('down', a.getMousePosition(e, a));
            if (target != null) {
                // Select a new object on start click
                a.mouse.setOffset(target.position);
                a.deselectScene(a);
                a.ui.showObjectOptions(true);
                a.selectedObject = target;
                a.selectedObject.select(true);
                a.ui.updateObjectOptions();
                a.mouse.moveCamera = false;
            }
            else {
                // Disable dragging if no selected object
                //a.mouse.drag = false;
                a.mouse.moveCamera = true;
            }
        }
    }

    mouseMove = function(e, a) {
        if (a.play == false) {
            a.mouse.setPosition('move', a.getMousePosition(e, a));
            // Update selected object if drag is true
            if (a.mouse.drag == true) {
                if (a.mouse.getTolerance() == true) {
                    var down = a.mouse.down;
                    var diff = a.mouse.getDragDifference();
                    if (a.mouse.moveCamera == true) {
                        // Update camera position
                        if (a.selectedObject != null){
                            a.selectedObject.select(false);
                            a.selectedObject = null;
                        }
                        //a.camera.position.x += diff.x;
                        //a.camera.position.y += diff.y;
                    }
                    else {
                        if (a.selectedObject != null) {
                            a.mouse.moveCamera = false;
                            // Update object position if tolerance is true
                            a.selectedObject.setPosition(
                                a.mouse.snap(down.x - diff.x, a.snap),
                                a.mouse.snap(down.y - diff.y, a.snap)
                            );
                        }
                    }
                }
            }
        }
    }

    mouseUp = function(e, a) {
        if (a.play == false) {
            a.mouse.setPosition('up', a.getMousePosition(e, a));
            var target = a.getObject(e, a);
            if (target == null && a.selectedObject == null) {
                // Add cube if nothing is selected
                if (a.mouse.getTolerance() == false) {
                    a.deselectScene(a);
                    a.ui.showObjectOptions(true);
                    a.selectedObject = new Cube({ 
                        x: a.mouse.snap(a.mouse.down.x, a.snap), 
                        y: a.mouse.snap(a.mouse.down.y, a.snap),
                        z: 0
                    });
                    a.selectedObject.setScale(a.BOX_SIZE, a.BOX_SIZE, a.BOX_SIZE);
                    a.selectedObject.setColor('#620460');
                    a.scene.add(a.selectedObject);
                    Matter.World.add(a.engine.world, a.selectedObject.rectangle);
                    a.selectedObject.select(true);
                    a.ui.updateObjectOptions();
                }
            }
            else {
                if (target == null) {
                    // Deselected object
                    a.ui.showObjectOptions(false);
                    a.selectedObject.select(false);
                    a.selectedObject = null;
                }
            }
        }
    }

    setPosition = function(state, position) {
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