import { Vector2, Vector3 } from 'three';
import { Composite, World } from 'matter-js';
import { PuttyControls } from './PuttyControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class LevelEditor {
  constructor(camera, domElement) {
    // Set initial variables
    this.selectedObjectType = 'cube';

    // Add controls with camera and active canvas
    this.controlsPutty = new PuttyControls(camera, domElement);
    this.controlsPutty.threshold = 0.02; // Default 0.01
    this.controlsTransform = new TransformControls(camera, domElement);
    this.controlsTransform.showZ = true;
    this.controlsTransform.space = 'world';
    this.controlsTransform.showAll = false;
    this.duplicateOffset = new Vector3(0, 16, 0);
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
    this.selectedMode = 'translate';
    this.puttyAxes = ['X', 'Y', 'Z'];

    // Initialize helper visibility from current mode.
    this.applyControlsModeState();

    // Putty constrols events
    this.controlsPutty.addEventListener('dragstart', () => { this.controlsOrbit.enabled = false; this.saveSelectedObject(); });
    this.controlsPutty.addEventListener('dragend', () => { this.controlsOrbit.enabled = true; this.updateSelectedObject(); });
    this.controlsPutty.addEventListener('objectChange', () => {
      this.controlsPutty.moved = true;
      window.dispatchEvent(new CustomEvent('objectChange', { detail: app.selectedObject }));
    });

    // Transform controls events
    this.controlsTransform.addEventListener('mouseDown', () => { this.controlsOrbit.enabled = false; this.saveSelectedObject(); });
    this.controlsTransform.addEventListener('mouseUp', () => { this.controlsOrbit.enabled = true; this.updateSelectedObject(); });
    this.controlsTransform.addEventListener('objectChange', () => {
      this.controlsTransform.moved = true;
      window.dispatchEvent(new CustomEvent('objectChange', { detail: app.selectedObject }));
    });

    // Orbit controls events
    this.controlsOrbit.addEventListener('start', () => { this.controlsOrbit.moved = false; })
    this.controlsOrbit.addEventListener('change', () => { this.controlsOrbit.moved = true; })

    // Add render listeners
    this.boundUpdateRender = this.updateRender.bind(this);
    domElement.addEventListener('pointerdown', this.pointerDown.bind(this));
    domElement.addEventListener('pointermove', this.pointerMove.bind(this));
    domElement.addEventListener('pointerup', this.pointerUp.bind(this));
    domElement.addEventListener('wheel', this.boundUpdateRender);
    window.addEventListener('resize', this.boundUpdateRender);
    window.addEventListener('setSelectedObject', this.boundUpdateRender);
    window.addEventListener('setSelectedMode', this.boundUpdateRender);
    window.addEventListener('themeSelected', this.boundUpdateRender);
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
      // Manually update matrices for edited objects (scene.matrixWorldAutoUpdate is off)
      if (app.selectedObject) app.selectedObject.updateMatrixWorld();
      this.controlsTransform.getHelper().updateMatrixWorld();
      this.controlsPutty.getHelper().updateMatrixWorld();
      app.camera.updateMatrixWorld();
      app.graphics.render();
    }
  }

  mouseDown(e) {
    app.mouse.setPosition('down', app.mouse.getPosition(e));

    // Update snap settings for putty controls
    this.controlsPutty.moved = false;
    this.controlsPutty.snap = app.mouse.snap;
    
    // Update transform controls snap settings
    this.controlsTransform.moved = false;
    this.controlsTransform.setTranslationSnap(app.mouse.snap);
    this.controlsTransform.setScaleSnap(app.mouse.snap);
    this.controlsTransform.setRotationSnap(app.mouse.snap > 1 ? (Math.PI / 12) : null); // 15 degrees or granular (null)
  }

  mouseMove(e) {
    app.mouse.setPosition('move', app.mouse.getPosition(e));
  }

  mouseUp(e) {
    var target = app.mouse.clickObject(e);
    app.mouse.setPosition('up', app.mouse.getPosition(e));

    // Allow quick erase
    if (e.button == 2) app.mouse.mode = 'erase';

    // Check if drawing or erasing
    if (app.mouse.mode == 'draw') {
      // Check if object is not selected
      if (app.selectedObject == null || target) {
        // Select a new object on start click
        if (target) {
          // Copy selected object color to target color
          if (e.shiftKey === true) {
            if (app.selectedObject) {
              target.setColors(app.selectedObject.color);
              app.levelHistory.save('Copied color');
              this.updateRender();
              return;
            }
          }

          if (this.controlsTransform.moved == false &&
            this.controlsOrbit.moved == false &&
            this.controlsPutty.moved == false) {
            app.level.deselectLevel();
            app.selectedObject = target;
            app.selectedObject.select(true);
            this.attachControls(target);

            // Update Vue.js UI from custom event
            if (app.selectedObject.getClass() != 'player') window.dispatchEvent(new CustomEvent('selectObjectType', { detail: { type: app.selectedObject.getClass(), checkNull: false }}));
            window.dispatchEvent(new CustomEvent('setSelectedObject', { detail: app.selectedObject }));
          }
        }
        else {
          // Add a new object if camera did not move
          if (this.controlsOrbit.moved == false && this.isSnapped()) {
            var objectType = this.selectedObjectType;
            var objectData = {
              class: objectType,
              color: app.level.entityFactory.color,
              isStatic: true,
              position: { 
                x: app.mouse.snapToValue(app.mouse.down.x, app.mouse.snap), 
                y: app.mouse.snapToValue(app.mouse.down.y, app.mouse.snap), 
                z: 0 
              },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: app.BOX_SIZE, y: app.BOX_SIZE, z: app.BOX_SIZE }
            };
            app.level.deselectLevel(); // Deselect everything
            app.selectedObject = app.level.entityFactory.createObject(objectType);
            app.level.setObjectProperties(app.selectedObject, objectData);
            app.level.addObject(app.selectedObject);
            app.levelHistory.save('Added ' + objectType);
            app.selectedObject.select(true);
            this.attachControls(app.selectedObject);
            window.dispatchEvent(new CustomEvent('setSelectedObject', { detail: app.selectedObject }));
          }
        }
      }
      else {
        // Deselect if object and camera was not moved
        if (this.controlsTransform.moved == false &&
          this.controlsOrbit.moved == false &&
          this.controlsPutty.moved == false &&
          this.isSnapped()) {
          app.level.deselectLevel();
          this.detachControls();
          window.dispatchEvent(new CustomEvent('setSelectedObject'));
        }
      }
    }
    else if (app.mouse.mode == 'erase') {
      this.eraseTarget(e);
    }

    // Reset mouse mode after quick erase
    if (e.button == 2) app.mouse.mode = app.mouse.prevMode;
  }

  keyDown(e) {
    this.keys[e.code] = true;
    
    // Enable lockRotation when holding Shift
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.controlsPutty.lockRotation = true;
    }
    
    this.updateRender();
  }
  
  keyUp(e) {
    this.keys[e.code] = false;
    
    // Disable lockRotation when releasing Shift
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.controlsPutty.lockRotation = false;
    }
    
    this.updateRender();
  }

  eraseTarget(e) {
    var target = app.mouse.clickObject(e);
    if (target != null) {
      if (target.getClass() != 'player') {
        target.select(true);
        app.level.removeObject(target, true);
      }
    }
  }

  duplicateSelectedObject(offset = { x: 0, y: 0, z: 0 }) {
    const isPlayerSelected = app.selectedObject.getClass() == 'player';
    if (app.selectedObject && !isPlayerSelected) {
      // Update object select state before duplication
      app.selectedObject.select(false);
      app.selectedObject = app.level.duplicateObject(app.selectedObject);

      // Add offset and update position
      app.selectedObject.position.add(offset);
      app.selectedObject.setPosition(app.selectedObject.position);
      app.selectedObject.select(true);

      // Update Vue.js UI from custom event
      this.attachControls(app.selectedObject);
      app.levelHistory.save('Duplicated object');
    }
  }

  deleteSelectedObject() {
    if (app.selectedObject) {
      app.level.removeObject(app.selectedObject, true);
      app.levelEditor.detachControls();
      app.levelHistory.save('Deleted object');
      window.dispatchEvent(new CustomEvent('setSelectedObject'));
    }
  }

  saveLevel() {
    this.detachControls();
    app.resetScene();
    app.level.deselectLevel();
    app.level.saveLevelData();
  }

  exitLevel() {
    if (app.levelHistory.history.length > 2) {
      // Dispatch new popup from event
      window.dispatchEvent(new CustomEvent('openPopup', {
        detail: {
          text: 'popup.text.save_level',
          inputs: [
            { value: 'popup.button.no', type: 'button', callback: () => { this.saveAndExitLevelEditor(false); window.dispatchEvent(new CustomEvent('closePopup')); }},
            { value: 'popup.button.yes', type: 'button', callback: () => { this.saveAndExitLevelEditor(true); window.dispatchEvent(new CustomEvent('closePopup')); }},
          ]
        }
      }));
    }
    else this.saveAndExitLevelEditor(false);
  }

  saveAndExitLevelEditor(saveLevel) {
    this.controlsOrbit.enabled = false;
    this.controlsOrbit.reset();
    this.detachControls();
    app.play = false;
    if (saveLevel == true) this.saveLevel();
    app.level.clearLevel();
    app.levelHistory.clear();
    app.player.removeCheckpoint();
    app.player.setPosition({ x: 0, y: 0, z: 0 });
    this.controlsOrbit.enabled = false;
    window.dispatchEvent(new CustomEvent('setPage', { detail: 'level-manager' }));
  }

  undo() {
    this.detachControls();
    app.levelHistory.undo();
    window.dispatchEvent(new CustomEvent('setSelectedObject'));
  }

  redo() {
    app.levelHistory.redo();
    window.dispatchEvent(new CustomEvent('setSelectedObject'));
  }

  rewind() {
    app.level.retryLevel(true);
    app.level.deselectLevel();
    app.levelEditor.detachControls();
    app.pauseLevel();
    window.dispatchEvent(new CustomEvent('setSelectedObject'));
  }

  saveSelectedObject() {
    if (this.selectedMode === 'putty') {

    }
    else {
      // Duplicate before saving
      if (this.keys['ShiftLeft']) {
        this.duplicateSelectedObject();
      }
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
      this.duplicateOffset.copy(target.position).sub(target.position0);
    }
    else {
      // Reset duplication position
      this.duplicateOffset.set(0, 16, 0);
    }

    // Update body state (-1 == active physics)
    if (target.position.z == 0) {
      target.body.collisionFilter.mask = -1;
      if (!Composite.get(app.engine.world, target.body.id, 'body')) {
        World.add(app.engine.world, target.body);
        app.scene.add(target.helper);
        target.helper.updateMatrixWorld();
      }
    }
    else {
      target.body.collisionFilter.mask = 0; // Disable physics
      if (Composite.get(app.engine.world, target.body.id, 'body')) {
        World.remove(app.engine.world, target.body);
        app.scene.remove(target.helper);
      }
    }

    // Update body position
    target.setPosition(target.getPosition());

    // Update body scale (reset transformation first)
    var tempAngle = target.rotation.z;
    target.setRotation(0, false);
    target.setBodyScale(target.scale.x / target.scale0?.x || 1, target.scale.y / target.scale0?.y || 1);
    target.setRotation(tempAngle, false); // Revert angle
    target.setScale(target.getScale());

    // Refresh body rotation
    target.setRotation(target.getRotation());
    app.levelHistory.save('Object updated');
  }

  attachControls(target) {
    if (!target) return;
    this.controlsTransform.attach(target);
    this.controlsPutty.attach(target);
    this.applyControlsModeState();
  }

  detachControls() {
    this.controlsTransform.detach();
    this.controlsPutty.detach();
    this.applyControlsModeState();
  }

  applyControlsModeState() {
    const mode = this.selectedMode || 'translate';
    const hasSelection = this.controlsTransform.object != null;
    const isPuttyActive = hasSelection && mode == 'putty';

    this.controlsPutty.getHelper().visible = isPuttyActive;
    this.controlsPutty.enabled = isPuttyActive;
    this.controlsTransform.getHelper().visible = hasSelection && mode != 'putty';
    this.controlsTransform.enabled = mode != 'putty';

    if (mode != 'putty') {
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
    }
  }

  setMode(mode) {
    // Swap Putty axis if putty mode is selected again
    if (mode == 'putty' && this.selectedMode == 'putty') {
      const currentAxis = this.controlsPutty.axis || 'X';
      const currentIndex = this.puttyAxes.indexOf(currentAxis);
      const nextIndex = (currentIndex + 1) % this.puttyAxes.length;
      
      // Update putty controls axis and color
      this.controlsPutty.axis = this.puttyAxes[nextIndex];
      this.controlsPutty.updateHelper();
    }

    // Update mode state
    this.selectedMode = mode;
    this.applyControlsModeState();
    this.attachControls(app.selectedObject);

    // Dispatch level editor mode change
    window.dispatchEvent(new CustomEvent('setSelectedMode', { detail: mode }));
  }

  selectObjectType(type, checkNull = true) {
    // Swap object by type
    if (app.selectedObject != null && checkNull == true) {
      app.selectedObject = app.level.changeObjectType(app.selectedObject, type);
      app.selectedObject.select(true);
      app.levelEditor.attachControls(app.selectedObject);
      app.levelHistory.save('Changed object to ' + type);
      window.dispatchEvent(new CustomEvent('setSelectedObject', { detail: app.selectedObject }));
    }

    // Set new selected object type
    app.levelEditor.selectedObjectType = type;
  }

  toggleSelectedObjectStaticState() {
    app.selectedObject.toggleStatic();
    app.selectedObject = app.level.refreshObject(app.selectedObject);
    app.selectedObject.select(true);
    app.levelEditor.attachControls(app.selectedObject);
    app.levelHistory.save('Updated object state');
    window.dispatchEvent(new CustomEvent('setSelectedObject', { detail: app.selectedObject }));
  }
}

export { LevelEditor };