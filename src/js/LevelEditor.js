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
            this.controlsTransform.attach(target);

            // Update Vue.js UI from custom event
            if (a.selectedObject.getClass() != 'player') window.dispatchEvent(new CustomEvent('selectObjectType', { detail: { type: a.selectedObject.getClass(), checkNull: false }}));
            window.dispatchEvent(new CustomEvent('setSelectedObject', { detail: a.selectedObject }));
          }
        }
        else {
          // Add a new object if camera did not move
          if (this.controlsOrbit.moved == false) {
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

  eraseTarget(e, a) {
    var target = a.mouse.clickObject(e, a);
    if (target != null) {
      if (target.getClass() != 'player') {
        target.select(true);
        a.level.removeObject(target, a, true);
      }
    }
  }

  duplicateSelectedObject() {
    app.selectedObject.select(false);
    app.selectedObject = app.level.duplicateObject(app.selectedObject, app);
    app.selectedObject.position.y += 16;
    app.selectedObject.select(true);
    app.levelEditor.controlsTransform.attach(app.selectedObject);
    app.levelEditor.setMode('translate');
    app.levelHistory.save('Duplicated object', app);
  }

  deleteSelectedObject() {
    app.level.removeObject(app.selectedObject, app);
    app.levelEditor.controlsTransform.detach();
    app.levelHistory.save('Deleted object', app);
    window.dispatchEvent(new CustomEvent('setSelectedObject'));
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
          text: 'Would you like to <em>save</em> your level?',
          inputs: [
            { value: 'No', type: 'button', callback: function() { app.levelEditor.saveAndExitLevelEditor(false); window.dispatchEvent(new CustomEvent('closePopup')); }},
            { value: 'Yes', type: 'button', callback: function() { app.levelEditor.saveAndExitLevelEditor(true); window.dispatchEvent(new CustomEvent('closePopup')); }},
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
    window.dispatchEvent(new CustomEvent('setPage', { detail: { page: 'level-manager' }}));
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