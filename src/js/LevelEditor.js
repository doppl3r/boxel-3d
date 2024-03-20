import $ from 'jquery';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class LevelEditor {
    constructor(camera, domElement) {
        this.controlsTransform = new TransformControls(camera, domElement);
        this.controlsTransform.showZ = true;
        this.controlsTransform.space = 'world';
        this.controlsTransform.traverse(function(obj) { obj.isTransformable = true });
        this.controlsOrbit = new OrbitControls(camera, domElement);
        this.controlsOrbit.enabled = false; // Default disabled for campaign
        this.controlsOrbit.mouseButtons = { LEFT: 2, MIDDLE: 2, RIGHT: 0 };
        this.controlsOrbit.zoomSpeed = 3;
        this.controlsOrbit.minDistance = 10;
        this.controlsOrbit.maxDistance = 1000;

        // Set events
        var _this = this;
        this.controlsTransform.addEventListener('mouseDown', function() { _this.controlsOrbit.enabled = false; _this.saveSelectedObject(); });
        this.controlsTransform.addEventListener('mouseUp', function() { _this.controlsOrbit.enabled = true; _this.updateSelectedObject(); });
        this.controlsTransform.addEventListener('objectChange', function() { _this.controlsTransform.moved = true; });
        this.controlsOrbit.addEventListener('start', function() { _this.controlsOrbit.moved = false; })
        this.controlsOrbit.addEventListener('change', function() { _this.controlsOrbit.moved = true; })
    }

    mouseDown(e, a) {
        a.mouse.setPosition('down', a.mouse.getPosition(e, a));
        this.controlsTransform.moved = false;
        this.controlsTransform.setTranslationSnap(a.mouse.snap);
        this.controlsTransform.setScaleSnap(a.mouse.snap);
        this.controlsTransform.setRotationSnap(a.mouse.snap > 1 ? (Math.PI / 12) : null); // 15 degrees or granular (null)
    }

    mouseMove(e, a) {
        a.mouse.setPosition('move', a.mouse.getPosition(e, a));
    }

    mouseUp(e, a) {
        var target = a.mouse.clickObject(e, a);
        a.mouse.setPosition('up', a.mouse.getPosition(e, a));

        // Allow quick erase
        if (e.button == 2) a.mouse.mode = 'erase';

        // Check if drawing or erasing
        if (a.mouse.mode == 'draw') {
            // Check if object is not selected
            if (a.selectedObject == null || target) {
                // Select a new object on start click
                if (target) {
                    if (this.controlsTransform.moved == false && this.controlsOrbit.moved == false) {
                        a.level.deselectLevel(a);
                        a.selectedObject = target;
                        a.selectedObject.select(true);
                        a.ui.updateObjectOptions();
                        a.ui.selectObjectType(a.selectedObject.getClass(), false);
                        this.controlsTransform.attach(target);
                        window.dispatchEvent(new CustomEvent('showObjectOptions', { detail: true }));
                    }
                }
                else {
                    // Add a new object if camera did not move
                    if (this.controlsOrbit.moved == false) {
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
                        a.selectedObject = a.level.entityFactory.createObject(objectType);
                        a.level.setObjectProperties(a.selectedObject, objectData);
                        a.level.addObject(a.selectedObject, a);
                        a.levelHistory.save('Added ' + objectType, a);
                        a.selectedObject.select(true);
                        a.ui.updateObjectOptions();
                        this.controlsTransform.attach(a.selectedObject);
                        window.dispatchEvent(new CustomEvent('showObjectOptions', { detail: true }));
                    }
                }
            }
            else {
                // Deselect if object and camera was not moved
                if (this.controlsTransform.moved == false && this.controlsOrbit.moved == false) {
                    a.level.deselectLevel(app);
                    this.controlsTransform.detach();
                    window.dispatchEvent(new CustomEvent('showObjectOptions', { detail: false }));
                }
            }
        }
        else if (a.mouse.mode == 'erase') {
            if (this.controlsOrbit.moved == false) {
                a.levelEditor.eraseTarget(e, a);
                a.level.deselectLevel(a); // Deselect everything
                a.levelHistory.save('Erased object', a);
                a.ui.updateLevelOptions();
                this.controlsTransform.detach();
                window.dispatchEvent(new CustomEvent('showObjectOptions', { detail: false }));
            }
            a.mouse.mode = a.mouse.prevMode;
        }
    }

    eraseTarget(e, a) {
        var target = a.mouse.clickObject(e, a);
        if (target != null) {
            if (target.getClass() != 'player') {
                target.select(true);
                a.level.removeObject(target, a, true);
            }
        }
    }

    duplicateSelected(a) {
        if (a.selectedObject != null) {
            $('[action="duplicate"]').click();
        }
    }

    deleteSelected(a) {
        if (a.selectedObject != null) {
            $('[action="trash"]').click();
            this.controlsTransform.detach();
        }
    }

    undoEdit() {
        $('[action="undo"]').click();
    }

    redoEdit() {
        $('[action="redo"]').click();
    }

    saveLevel() {
        $('[action="save"]').click();
    }

    saveSelectedObject() {
        var target = app.selectedObject;
        target.position0 = target.position.clone();
        target.scale0 = target.scale.clone();
        target.rotation0 = target.rotation.clone();
    }

    resetZAxis() {
        if (app.selectedObject) {
            app.selectedObject.position.z = 0;
            this.updateSelectedObject();
        }
    }

    updateSelectedObject() {
        var target = app.selectedObject;

        // Update body state (-1 == active physics)
        if (target.position.z == 0) target.body.collisionFilter.mask = -1;
        else target.body.collisionFilter.mask = 0; // Disable physics

        // Update body position
        target.setPosition(target.getPosition());

        // Update body scale (reset transformation first)
        var tempAngle = target.rotation.z;
        target.setRotation(0, false);
        target.setBodyScale(target.scale.x / target.scale0.x, target.scale.y / target.scale0.y);
        target.setRotation(tempAngle, false); // Revert angle
        target.setScale(target.getScale());

        // Refresh body rotation
        target.setRotation(target.getRotation());
        app.levelHistory.save('Object updated', app);
    }

    setMode(mode) {
        this.controlsTransform.setMode(mode);
        if (mode == 'translate') {
            this.controlsTransform.showX = true;
            this.controlsTransform.showY = true;
            this.controlsTransform.showZ = true;
        }
        else if (mode == 'scale') {
            this.controlsTransform.showX = true;
            this.controlsTransform.showY = true;
            this.controlsTransform.showZ = true;
        }
        else if (mode == 'rotate') {
            this.controlsTransform.showX = false;
            this.controlsTransform.showY = false;
            this.controlsTransform.showZ = true;
        }
    }
}

export { LevelEditor };