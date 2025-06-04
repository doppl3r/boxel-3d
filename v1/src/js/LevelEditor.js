import { Vector2, Vector3 } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class LevelEditor {
  constructor(camera, domElement) {
    // Set initial variables
    this.selectedObjectType = 'cube';

    // Add controls with camera and active canvas
    this.controlsTransform = new TransformControls(camera, domElement);
    this.controlsTransform.showZ = true;
    this.controlsTransform.space = 'world';
    this.controlsTransform.showAll = false;
    this.controlsTransform.offset = new Vector3(0, 16, 0);
    this.controlsOrbit = new OrbitControls(camera, domElement);
    this.controlsOrbit.enabled = false; // Default disabled for campaign
    this.controlsOrbit.mouseButtons = { LEFT: 2, MIDDLE: 2, RIGHT: 0 }; // 0 = Left/Rotate, 1 = Middle/Dolly, 2 = Right/Pan
    this.controlsOrbit.touches = { ONE: 1, TWO: 3 }; // 0 = Rotate, 1 = Pan, 2 = Dolly pan, 3 = Dolly rotate
    this.controlsOrbit.zoomSpeed = 3;
    this.controlsOrbit.minDistance = 10;
    this.controlsOrbit.maxDistance = 1000;
    this.controlsOrbit.rotateSpeed = 0.5 // Default 1;
		this.controlsOrbit.rotateSpeedDefault = 0.5 // Default 1;
    this.controlsOrbit.panSpeed = 1;
		this.controlsOrbit.panSpeedDefault = 1;
    this.down = new Vector2();
    this.move = new Vector2();
    this.up = new Vector2();
    this.drag = false;
    this.snap = 16;
    this.keys = {};

    // Set events
    this.controlsTransform.addEventListener('mouseDown', () => { this.controlsOrbit.enabled = false; this.saveSelectedObject(); });
    this.controlsTransform.addEventListener('mouseUp', () => { this.controlsOrbit.enabled = true; this.updateSelectedObject(); });
    this.controlsTransform.addEventListener('objectChange', () => { this.controlsTransform.moved = true; });
    this.controlsOrbit.addEventListener('start', () => { this.controlsOrbit.moved = false; })
    this.controlsOrbit.addEventListener('change', () => { this.controlsOrbit.moved = true; })

    // Add render listeners
    domElement.addEventListener('pointerdown', this.pointerDown.bind(this));
    domElement.addEventListener('pointermove', this.pointerMove.bind(this));
    domElement.addEventListener('pointerup', this.pointerUp.bind(this));
    domElement.addEventListener('wheel', this.updateRender);
    window.addEventListener('resize', this.updateRender);
    window.addEventListener('setSelectedObject', this.updateRender);
    window.addEventListener('setSelectedMode', this.updateRender);
    window.addEventListener('themeSelected', this.updateRender);
    window.addEventListener('keydown', this.keyDown.bind(this));
    window.addEventListener('keyup', this.keyUp.bind(this));
  }

  pointerDown(e) {
    this.down.set(e.clientX, e.clientY);
    this.drag = true;
    this.controlsOrbit.rotateSpeed = 0; // Deactivate camera by default
    this.controlsOrbit.panSpeed = 0;
    this.updateRender();
  }

  pointerMove(e) {
    this.move.set(e.clientX, e.clientY);

    // Check if orbit controls can be updated
    if (this.isSnapped() == false) {
      this.controlsOrbit.rotateSpeed = this.controlsOrbit.rotateSpeedDefault;
      this.controlsOrbit.panSpeed = this.controlsOrbit.panSpeedDefault;
    }
    this.updateRender();
  }

  pointerUp(e) {
    this.up.set(e.clientX, e.clientY);
    this.drag = false;
    this.updateRender();
  }

  isSnapped() {
    var distance = this.down.distanceTo(this.move);
    return distance < this.snap;
  }

  updateRender() {
    // Only force render level editor if app is paused
    if (app.state == 'level-editor' && app.play == false) {
      app.graphics.render();
    }
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
            this.controlsTransform.attach(target);

            // Update Vue.js UI from custom event
            if (a.selectedObject.getClass() != 'player') window.dispatchEvent(new CustomEvent('selectObjectType', { detail: { type: a.selectedObject.getClass(), checkNull: false }}));
            window.dispatchEvent(new CustomEvent('setSelectedObject', { detail: a.selectedObject }));
          }
        }
        else {
          // Add a new object if camera did not move
          if (this.controlsOrbit.moved == false && this.isSnapped()) {
            var objectType = app.levelEditor.selectedObjectType;
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
            this.controlsTransform.attach(a.selectedObject);
            window.dispatchEvent(new CustomEvent('setSelectedObject', { detail: a.selectedObject }));
          }
        }
      }
      else {
        // Deselect if object and camera was not moved
        if (this.controlsTransform.moved == false && this.controlsOrbit.moved == false) {
          a.level.deselectLevel(app);
          this.controlsTransform.detach();
          window.dispatchEvent(new CustomEvent('setSelectedObject'));
        }
      }
    }
    else if (a.mouse.mode == 'erase') {
      if (this.controlsOrbit.moved == false) {
        a.levelEditor.eraseTarget(e, a);
        a.level.deselectLevel(a); // Deselect everything
        a.levelHistory.save('Erased object', a);
        this.controlsTransform.detach();
        window.dispatchEvent(new CustomEvent('setSelectedObject'));
      }
      a.mouse.mode = a.mouse.prevMode;
    }
  }

  keyDown(e) {
    this.keys[e.code] = true;
  }
  
  keyUp(e) {
    this.keys[e.code] = false;
    this.updateRender()
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

  duplicateSelectedObject(offset = { x: 0, y: 0, z: 0 }) {
    if (app.selectedObject) {
      app.selectedObject.select(false);
      app.selectedObject = app.level.duplicateObject(app.selectedObject, app);
      app.selectedObject.position.add(offset); // Add offset
      app.selectedObject.select(true);
      app.levelEditor.controlsTransform.attach(app.selectedObject);
      app.levelEditor.setMode('translate');
      app.levelHistory.save('Duplicated object', app);
    }
  }

  deleteSelectedObject() {
    if (app.selectedObject) {
      app.level.removeObject(app.selectedObject, app);
      app.levelEditor.controlsTransform.detach();
      app.levelHistory.save('Deleted object', app);
      window.dispatchEvent(new CustomEvent('setSelectedObject'));
    }
  }

  saveLevel() {
    app.levelEditor.controlsTransform.detach();
    app.resetScene(app);
    app.level.deselectLevel(app);
    app.level.saveLevelData(app);
  }

  exitLevel() {
    if (app.levelHistory.history.length > 2) {
      // Dispatch new popup from event
      window.dispatchEvent(new CustomEvent('openPopup', {
        detail: {
          text: 'popup.text.save_level',
          inputs: [
            { value: 'popup.button.no', type: 'button', callback: function() { app.levelEditor.saveAndExitLevelEditor(false); window.dispatchEvent(new CustomEvent('closePopup')); }},
            { value: 'popup.button.yes', type: 'button', callback: function() { app.levelEditor.saveAndExitLevelEditor(true); window.dispatchEvent(new CustomEvent('closePopup')); }},
          ]
        }
      }));
    }
    else app.levelEditor.saveAndExitLevelEditor(false);
  }

  saveAndExitLevelEditor(saveLevel) {
    app.levelEditor.controlsOrbit.enabled = false;
    app.levelEditor.controlsOrbit.reset();
    app.levelEditor.controlsTransform.detach();
    app.play = false;
    if (saveLevel == true) app.levelEditor.saveLevel();
    app.level.clearLevel(app);
    app.levelHistory.clear();
    app.player.removeCheckpoint();
    app.player.setPosition({ x: 0, y: 0, z: 0 });
    app.levelEditor.controlsOrbit.enabled = false;
    window.dispatchEvent(new CustomEvent('setPage', { detail: 'level-manager' }));
  }

  undo() {
    app.levelEditor.controlsTransform.detach();
    app.levelHistory.undo(app);
    window.dispatchEvent(new CustomEvent('setSelectedObject'));
  }

  redo() {
    app.levelHistory.redo(app);
    window.dispatchEvent(new CustomEvent('setSelectedObject'));
  }

  rewind() {
    app.level.retryLevel(app);
    app.level.deselectLevel(app);
    app.pauseLevel();
    window.dispatchEvent(new CustomEvent('setSelectedObject'));
  }

  saveSelectedObject() {
    // Duplicate before saving
    if (this.keys['ShiftLeft'] === true) {
      this.duplicateSelectedObject();
    }

    // Copy properties before transforming
    var target = app.selectedObject;
    if (target) {
      target.position0 = target.position.clone();
      target.scale0 = target.scale.clone();
      target.rotation0 = target.rotation.clone();
    }
  }

  resetZAxis() {
    if (app.selectedObject) {
      app.selectedObject.position.z = 0;
      this.updateSelectedObject();
    }
  }

  updateSelectedObject() {
    var target = app.selectedObject;

    // Update offset for duplication
    if (this.keys['ShiftLeft']) {
      this.controlsTransform.offset.copy(target.position).sub(target.position0);
    }
    else {
      // Reset duplication position
      this.controlsTransform.offset.set(0, 0, 0);
    }

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
      this.controlsTransform.showX = this.controlsTransform.showAll; // Default false
      this.controlsTransform.showY = this.controlsTransform.showAll; // Default false
      this.controlsTransform.showZ = true;
    }

    // Dispatch level editor more change
    window.dispatchEvent(new CustomEvent('setSelectedMode', { detail: mode }));
  }

  selectObjectType(type, checkNull = true) {
    // Swap object by type
    if (app.selectedObject != null && checkNull == true) {
      app.selectedObject = app.level.changeObjectType(app.selectedObject, type, app);
      app.selectedObject.select(true);
      app.levelEditor.controlsTransform.attach(app.selectedObject);
      app.levelHistory.save('Changed object to ' + type, app);
      window.dispatchEvent(new CustomEvent('setSelectedObject', { detail: app.selectedObject }));
    }

    // Set new selected object type
    app.levelEditor.selectedObjectType = type;
  }

  toggleSelectedObjectStaticState() {
    app.selectedObject.toggleStatic();
    app.selectedObject = app.level.refreshObject(app.selectedObject, app);
    app.selectedObject.select(true);
    app.levelEditor.controlsTransform.attach(app.selectedObject);
    app.levelHistory.save('Updated object state', app);
    window.dispatchEvent(new CustomEvent('setSelectedObject', { detail: app.selectedObject }));
  }
}

export { LevelEditor };