class LevelEditor {
    constructor() {

    }

    mouseDown(e, a) {
        // Allow right click toggle to erase
        if (e.button == 2) {
            a.mouse.mode = 'erase';
            a.ui.updateLevelOptions()
        }

        // Check if drawing or erasing
        a.mouse.setPosition('down', a.mouse.getPosition(e, a));
        if (a.mouse.mode == 'draw') {
            var target = a.mouse.clickObject(e, a);
            a.camera.moved = false;
            a.mouse.setOffset(a.mouse.down);
            // Select a new object on start click
            if (target != null) {
                a.mouse.setOffset(target.position);
                a.level.deselectLevel(a);
                a.ui.showObjectOptions(true);
                a.selectedObject = target;
                a.selectedObject.select(true);
                a.ui.updateObjectOptions();
                a.ui.selectObjectType(a.selectedObject.getClass(), false);
                a.camera.allowMovement = false;
            }
            else {
                // Enable camera dragging
                a.camera.allowMovement = true;
            }
        }
        else if (a.mouse.mode == 'erase') {
            a.levelEditor.eraseTarget(e, a);
            a.level.deselectLevel(a); // Deselect everything
            a.ui.showObjectOptions(false);
        }
    }

    mouseMove(e, a) {
        a.mouse.setPosition('move', a.mouse.getPosition(e, a));
        // Update selected object if drag is true
        if (a.mouse.drag == true) {
            if (a.mouse.mode == 'draw') {
                // Update object or camera position if tolerance is true
                if (a.mouse.getTolerance() == true) {
                    // Update camera position
                    var down = a.mouse.down;
                    var diff = a.mouse.getDragDifference();
                    
                    // If 's' is not selected, begin moving camera or object
                    if (a.levelEditor.isScaling != true) {
                        if (a.camera.allowMovement == true) {
                            // Resolve camera ray miscalculations
                            var camTolerance = a.camera.position.z / 2;
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
                                    x: a.mouse.snapToValue(down.x - diff.x, a.mouse.snap),
                                    y: a.mouse.snapToValue(down.y - diff.y, a.mouse.snap)
                                });
                            }
                        }
                    }
                    else {
                        // Start scaling object
                        var s = a.selectedObject.getScaleOrigin();
                        var x = a.mouse.snapToValue(s.x - diff.x, a.mouse.snap);
                        var y = a.mouse.snapToValue(s.y - diff.y, a.mouse.snap);
                        if (x == 0) x = 16;
                        if (y == 0) y = 16;
                        a.selectedObject.setScale({ x: x, y: y }, false);
                    }
                }
            }
            else if (a.mouse.mode == 'erase') {
                a.levelEditor.eraseTarget(e, a);
            }
        }
    }

    mouseUp(e, a) {
        var target = a.mouse.clickObject(e, a);
        a.mouse.setPosition('up', a.mouse.getPosition(e, a));
        
        // Store selected object scale origin
        if (a.selectedObject != null) {
            a.selectedObject.setScale(a.selectedObject.getScale());
        }

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
                                x: a.mouse.snapToValue(a.mouse.down.x, a.mouse.snap), 
                                y: a.mouse.snapToValue(a.mouse.down.y, a.mouse.snap), 
                                z: 0 
                            },
                            rotation: { x: 0, y: 0, z: 0 },
                            scale: { x: a.BOX_SIZE, y: a.BOX_SIZE, z: a.BOX_SIZE }
                        };
                        a.level.deselectLevel(a); // Deselect everything
                        a.selectedObject = a.level.createObject(objectType);
                        a.level.setObjectProperties(a.selectedObject, objectData);
                        a.level.addObject(a.selectedObject, a);
                        a.levelHistory.save('Added ' + objectType, a);
                        a.selectedObject.select(true);
                        a.ui.showObjectOptions(true);
                        a.ui.updateObjectOptions();
                    }
                }
            }
            else {
                // Save history if object was moved
                if (a.mouse.getTolerance() != false) {
                    a.levelHistory.save('Moved object', a);
                }
            }
        }
        else if (a.mouse.mode == 'erase') {
            if (a.mouse.erased == true) {
                a.levelHistory.save('Erased object', a);
                a.mouse.erased = false; // Reset state
            }
        }
        
        // Reset right click toggle to erase
        if (e.button == 2) {
            a.mouse.mode = a.mouse.prevMode;
            a.ui.updateLevelOptions()
        }
        //if (a.selectedObject == null) a.levelEditor.setScalingState(a, false);
        a.levelEditor.setScalingState(a, false);
    }

    eraseTarget(e, a) {
        var target = a.mouse.clickObject(e, a);
        if (target != null) {
            if (target.getClass() != 'player') {
                target.select(true);
                a.level.removeObject(target, a, true);
                a.mouse.erased = true; // Used for saving history
            }
        }
    }

    setScalingState(a, isScaling) {
        a.levelEditor.isScaling = isScaling;
    }
}