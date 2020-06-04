class Mouse {
    constructor() {
        this.down = new THREE.Vector3();
        this.move = new THREE.Vector3();
        this.offset = new THREE.Vector3();
        this.up = new THREE.Vector3();
        this.tolerance = 5;
        this.drag = false;
        this.mode = 'draw';
        this.prevMode = this.mode;
    }
    
    mouseDown(e, a) {
        if (a.play == false) {
            // Allow right click toggle to erase
            if (e.button == 2) {
                a.mouse.mode = 'erase';
                a.ui.updateLevelOptions()
            }

            // Check if drawing or erasing
            a.mouse.setPosition('down', a.getMousePosition(e, a));
            if (a.mouse.mode == 'draw') {
                var target = a.getObject(e, a);
                a.camera.moved = false;
                a.mouse.setOffset(a.mouse.down);
                // Select a new object on start click
                if (target != null) {
                    a.mouse.setOffset(target.position);
                    a.deselectScene(a);
                    a.ui.showObjectOptions(true);
                    a.selectedObject = target;
                    a.selectedObject.select(true);
                    a.ui.updateObjectOptions();
                    a.camera.allowMovement = false;
                }
                else {
                    // Enable camera dragging
                    a.camera.allowMovement = true;
                }
            }
            else if (a.mouse.mode == 'erase') {
                a.mouse.eraseTarget(e, a);
            }
        }
        else {
            a.player.jump();
        }
    }

    mouseMove(e, a) {
        if (a.play == false) {
            a.mouse.setPosition('move', a.getMousePosition(e, a));
            // Update selected object if drag is true
            if (a.mouse.drag == true) {
                if (a.mouse.mode == 'draw') {
                    // Update object or camera position if tolerance is true
                    if (a.mouse.getTolerance() == true) {
                        // Update camera position
                        var down = a.mouse.down;
                        var diff = a.mouse.getDragDifference();
                        var camTolerance = 100;
                        if (a.camera.allowMovement == true) {
                            // Resolve camera ray miscalculations
                            if (Math.abs(diff.x) > camTolerance || Math.abs(diff.y) > camTolerance || Math.abs(diff.z) > camTolerance) {
                                diff = { x: 0, y: 0, z: 0 };
                            }
                            // Update camera position
                            a.camera.position.x += diff.x;
                            a.camera.position.y += diff.y;
                            a.camera.moved = true;
                        }
                        else { // Update object position
                            if (a.selectedObject != null) {
                                a.camera.allowMovement = false;
                                a.selectedObject.setPosition({
                                    x: a.mouse.snap(down.x - diff.x, a.snap),
                                    y: a.mouse.snap(down.y - diff.y, a.snap)
                                });
                            }
                        }
                    }
                }
                else if (a.mouse.mode == 'erase') {
                    a.mouse.eraseTarget(e, a);
                }
            }
        }
    }

    mouseUp(e, a) {
        if (a.play == false) {
            var target = a.getObject(e, a);
            a.mouse.setPosition('up', a.getMousePosition(e, a));

            // Check if drawing or erasing
            if (a.mouse.mode == 'draw') {
                // Add cube if nothing is selected
                if (target == null) {
                    // Check if mouse moved more than tolerance
                    if (a.mouse.getTolerance() == false) {
                        // Check if the camera was not moved when given permission to add cube
                        if (a.camera.moved != true) {
                            var objectType = a.ui.getSelectedObjectType();
                            var objectData = {
                                class: objectType,
                                isStatic: true,
                                position: { 
                                    x: a.mouse.snap(a.mouse.down.x, a.snap), 
                                    y: a.mouse.snap(a.mouse.down.y, a.snap), 
                                    z: 0 
                                },
                                rotation: { x: 0, y: 0, z: 0 },
                                scale: { x: a.BOX_SIZE, y: a.BOX_SIZE, z: a.BOX_SIZE }
                            };
                            a.deselectScene(a); // Deselect everything
                            a.selectedObject = a.newObject(objectType);
                            a.level.setObjectProperties(a.selectedObject, objectData);
                            a.level.addObject(a.selectedObject, a);
                            a.levelHistory.save(a);
                            a.selectedObject.select(true);
                            a.ui.showObjectOptions(true);
                            a.ui.updateObjectOptions();
                        }
                    }
                }
                else {
                    // Save history if object was moved
                    if (a.mouse.getTolerance() != false) {
                        a.levelHistory.save(a);
                    }
                }
            }
            else if (a.mouse.mode == 'erase') {
                if (a.mouse.erased == true) {
                    a.levelHistory.save(a);
                    a.mouse.erased = false; // Reset state
                }
            }
            
            // Reset right click toggle to erase
            if (e.button == 2) {
                a.mouse.mode = a.mouse.prevMode;
                a.ui.updateLevelOptions()
            }
        }
    }

    wheel(e, a) {
        var zoom = a.camera.position.z + e.deltaY;
        if (zoom < 200) zoom = 200;
        else if (zoom > 1000) zoom = 1000;
        a.camera.position.z = zoom;
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

    snap(value, step) {
        return Math.round(value / step) * step;
    }

    setMode(mode) {
        this.mode = this.prevMode =  mode;
    }

    getMode() {
        return this.mode;
    }

    eraseTarget(e, a) {
        var target = a.getObject(e, a);
        if (target != null) {
            if (target.getClass() != 'player') {
                target.select(true);
                a.level.removeObject(target, a, true);
                a.mouse.erased = true; // Used for saving history
            }
        }
    }
}