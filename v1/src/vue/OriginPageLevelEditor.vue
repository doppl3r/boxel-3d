<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';
  import OriginControls from './OriginControls.vue';
  import { themes } from '../js/Data.js';

  const emit = defineEmits(['setPage']);
  const drawMode = ref('draw');
  const objectType = ref(app.levelEditor.selectedObjectType || 'cube');
  const objectTypeVisible = ref(true);
  const selectedObject = ref();
  const selectedTheme = ref(app.level.theme);
  const themeOptionsVisible = ref(false);
  const selectedMode = ref(app.levelEditor.controlsTransform.mode);
  const coordinates = ref('0, 0, 0');
  const isClosed = ref(true); // Popup animation state
  const isClosing = ref(false);
  const isInputEnabled = ref(true);

  function addEventListeners() {
    window.addEventListener('exitLevel', resetBackground);
    window.addEventListener('setSelectedObject', setSelectedObject);
    window.addEventListener('objectChange', updateCoordinatesFromEvent);
    window.addEventListener('selectObjectType', selectObjectType);
    window.addEventListener('setTransformMode', setTransformMode);
    window.addEventListener('popupOpened', popupOpened);
    window.addEventListener('popupClosed', popupClosed);
    window.addEventListener('popupClosing', popupClosing);
    window.addEventListener('pointerdown', pointerdown);
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
  }
  
  function removeEventListeners() {
    window.removeEventListener('exitLevel', resetBackground);
    window.removeEventListener('setSelectedObject', setSelectedObject);
    window.removeEventListener('objectChange', updateCoordinatesFromEvent);
    window.removeEventListener('selectObjectType', selectObjectType);
    window.removeEventListener('setTransformMode', setTransformMode);
    window.removeEventListener('popupOpened', popupOpened);
    window.removeEventListener('popupClosed', popupClosed);
    window.removeEventListener('pointerdown', pointerdown);
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('keyup', keyup);
  }

  function popupOpened() {
    isClosed.value = false;
    isInputEnabled.value = false;
  }
  
  function popupClosed() {
    isClosed.value = true;
    isClosing.value = false;
  }

  function popupClosing() {
    isClosing.value = true;
    setTimeout(function() {
      isInputEnabled.value = true;
    }, 50);
  }

  function setDrawMode(mode) {
    drawMode.value = mode;
    app.mouse.setMode(mode);
  }

  function exitLevel() {
    app.levelEditor.exitLevel();
  }

  function saveLevel() {
    app.levelEditor.saveLevel();
  }

  function saveThumbnail() {
    app.pauseLevel();
    app.storage.screenshot({ width: 1280, height: 720, save: true });
  }

  function selectTheme(name) {
    // Deselect before recoloring level children
    rewind();
    app.level.deselectLevel(app);
    app.levelEditor.controlsTransform.detach();
    app.levelEditor.controlsPutty.detach();

    // Store current theme settings
    const theme = app.level.getTheme(name);
    selectedTheme.value = name;
    app.background.setTheme(theme.model);
    app.level.entityFactory.color = theme.color;
    app.level.theme = name;
    
    // Recreate current level with new theme data
    const json = app.level.exportToJSON(app);

    // Change each child color to theme color
    json.children.forEach(child => {
      if (child.color) child.color = theme.color;
    });

    app.level.clearLevel(app);
    app.level.importFromJSON(json, app);
    app.levelHistory.save('Updated level theme', app);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('themeSelected', { detail: theme }));
  }

  function undo() {
    app.levelEditor.undo();
  }

  function redo() {
    app.levelEditor.redo();
  }

  function rewind() {
    pauseLevel();
    app.levelEditor.rewind();
    app.levelEditor.controlsOrbit.target.copy(app.player.position);
  }

  function pauseLevel() {
    objectTypeVisible.value = true;
    app.pauseLevel();
    app.level.deselectLevel(app);
    app.levelEditor.controlsOrbit.enabled = true;
    app.levelEditor.controlsOrbit.reset();
    app.levelEditor.controlsOrbit.target.copy(app.player.position);
    app.updateCamera(app);
    app.background.visible = false;
    window.dispatchEvent(new CustomEvent('setSelectedObject'));
  }
  
  function playCurrentLevel() {
    objectTypeVisible.value = false;
    app.background.visible = true;
    app.level.deselectLevel(app);
    app.levelEditor.controlsOrbit.enabled = false;
    app.levelEditor.controlsOrbit.reset();
    app.levelEditor.controlsTransform.detach();
    app.levelEditor.controlsPutty.detach();
    window.dispatchEvent(new CustomEvent('setSelectedObject'));
    app.startLevel();
  }

  function resetBackground() {
    objectTypeVisible.value = true;
  }

  function selectObjectType(e) {
    objectType.value = e.detail.type;
    app.levelEditor.selectObjectType(e.detail.type, e.detail.checkNull);
  }

  function setSelectedObject(e) {
    if (e.detail) updateCoordinates(e.detail.position);
    selectedObject.value = e.detail;
  }

  function toggleSelectedObjectStaticState() {
    app.levelEditor.toggleSelectedObjectStaticState();
  }

  function setTransformMode(e) {
    selectedMode.value = e.detail;
    app.levelEditor.setMode(e.detail);
  }

  function updateCoordinatesFromEvent(e) {
    const position = e.detail.position;
    updateCoordinates(position);
  }

  function updateCoordinatesFromMouse(e) {
    const position = app.mouse.getPosition(e, app);
    position.x = app.mouse.snapToValue(position.x, app.mouse.snap);
    position.y = app.mouse.snapToValue(position.y, app.mouse.snap);
    position.z = app.mouse.snapToValue(position.z, app.mouse.snap);
    updateCoordinates(position);
  }

  function updateCoordinates(position) {
    coordinates.value = `${ position.x }, ${ position.y }, ${ position.z }`;
  }

  function updatePositionFromEvent(e) {
    const points = e.target.value.split(',').map(point => point = parseInt(point) || 0);
    const position = { x: points[0] || 0, y: points[1] || 0, z: points[2] || 0 };
    if (selectedObject.value) {
      selectedObject.value.setPosition(position);
      app.levelEditor.updateSelectedObject();
      app.levelHistory.save('Updated object position', app);
    }
  }

  function toggleFriction(e) {
    const friction = selectedObject.value.getFriction();
    if (friction == 1) selectedObject.value.setFriction(0, true);
    else selectedObject.value.setFriction(1, true);
    app.levelHistory.save('Updated object properties', app);
  }

  function updateColor(e) {
    selectedObject.value.setColors(e.target.value);
    app.levelHistory.save('Updated object properties', app);
  }

  function changeText() {
    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: 'Edit',
        inputs: [
          { value: app.selectedObject.text, type: 'text', callback: updateText },
          { value: 'Cancel', type: 'button' },
          { value: 'Close', type: 'button' }
        ]
      }
    }));
  }

  function duplicateSelectedObject() {
    app.levelEditor.duplicateSelectedObject(app.levelEditor.duplicateOffset);
    setSelectedObject({ detail: app.selectedObject });
    window.dispatchEvent(new CustomEvent('setSelectedObject', { detail: app.selectedObject }));
  }

  function deleteSelectedObject() {
    app.levelEditor.deleteSelectedObject();
  }

  function updateText(e) {
    app.selectedObject.setText(e.target.value);
    app.levelHistory.save('Updated tip', app);
  }

  function pointerdown(e) {
    // Make sure popup is closed
    if (isClosed.value == true || isClosing.value === true) {
      // Enable input immediately
      isInputEnabled.value = true;
    }
  }

  function keydown(e) {
    // Ignore keyboard shortcuts when typing in an input field
    const targetTagName = e?.target?.tagName;
    if (targetTagName === 'INPUT' || targetTagName === 'TEXTAREA') return;

    // Make sure popup is closed
    if (isClosed.value == true || isClosing.value === true) {
      // Jump if one of the keys is pressed
      var jumpKeys = ['Space', 'Enter', 'ArrowUp', 'KeyW'];
      if (app.play == true) {
        if (e.code == 'Escape' || e.code == 'KeyE') {
          e.preventDefault();
          pauseLevel();
        }
        else if (e.code == 'KeyA' || e.code == 'ArrowLeft') {
          app.player.setControls('left', -1);
        }
        else if (e.code == 'KeyD' || e.code == 'ArrowRight') {
          app.player.setControls('right', 1);
        }
        else if (e.code == 'KeyR') {
          app.level.retryLevel();
        }
        else if (e.code == 'KeyC') {
          app.player.restart();
        }
        else {
          if (isInputEnabled.value === true && jumpKeys.includes(e.code)) {
            // Jump if one of the keys is pressed
            app.player.jump();
          }

          // Enable input immediately
          isInputEnabled.value = true;
        }
      }
      else {
        if (e.code == 'Digit0') {
          app.levelEditor.resetZAxis();
        }
        else if (e.code == 'Escape' || e.code == 'KeyE') {
          e.preventDefault();
          exitLevel();
        }
        else if (e.code == 'KeyD') {
          duplicateSelectedObject();
        }
        else if (e.code == 'KeyG' || e.code == 'KeyT') {
          setTransformMode({ detail: 'translate' });
        }
        else if (e.code == 'KeyQ') {
          setTransformMode({ detail: 'putty' });
        }
        else if (e.code == 'KeyR') {
          // Toggle rotation axis visibility before setting mode
          if (app.levelEditor.controlsTransform.mode == 'rotate') {
            app.levelEditor.controlsTransform.showAll = !app.levelEditor.controlsTransform.showAll;
          }
          setTransformMode({ detail: 'rotate' });
        }
        else if (e.code == 'KeyS') {
          if (e.ctrlKey == true) {
            e.preventDefault();
            app.levelEditor.saveLevel();
          }
          else setTransformMode({ detail: 'scale' });
        }
        else if (e.code == 'KeyX') {
          app.levelEditor.deleteSelectedObject();
        }
        else if (e.code == 'KeyZ' && e.ctrlKey) {
          if (e.shiftKey == false) app.levelEditor.undo();
          if (e.shiftKey == true) app.levelEditor.redo();
        }
      }
    }
  }

  function keyup(e) {
    if (e.code == 'KeyA' || e.code == 'ArrowLeft') {
      app.player.setControls('left', 0);
    }
    else if (e.code == 'KeyD' || e.code == 'ArrowRight') {
      app.player.setControls('right', 0);
    }
  }

  onMounted(function() {
    // Run function after being mounted (visible)
    app.canvas.classList.remove('hidden');
    addEventListeners();

    // Dispatch ready event to listeners
    window.dispatchEvent(new CustomEvent('pageMounted', { detail: 'level-editor' }));
  })

  onUnmounted(function() {
    // Run function after being unmounted (removed);
    app.canvas.classList.add('hidden');
    removeEventListeners();
  });
</script>

<template>
  <!--<Teleport to="body">
    <div v-if="objectTypeVisible == false" class="background-cubes"></div>
  </Teleport>-->
  <div class="level-editor">
    <div class="row top">
      <div class="col options-level">
        <a class="item" :class="{ selected: drawMode == 'draw' }" @click="setDrawMode('draw')" action="draw" title="Draw cubes"><img :src="'../svg/pencil.svg'"></a>
        <a class="item" :class="{ selected: drawMode == 'erase' }" @click="setDrawMode('erase')" action="erase" title="Erase cubes"><img :src="'../svg/eraser.svg'"></a>
        <a class="item" @click="exitLevel" title="Exit level editor (ESC)"><img :src="'../svg/home.svg'"></a>
        <a class="item" @click="saveLevel" title="Save level (Ctrl + S)"><img :src="'../svg/save.svg'"></a>
        <a class="item" @click="saveThumbnail" title="Save Screenshot"><img :src="'../svg/eye.svg'"></a>
        <a class="item" :class="{ selected: themeOptionsVisible == true }" @click="themeOptionsVisible = !themeOptionsVisible">
          <img :src="'../svg/color.svg'">
          <ul v-if="themeOptionsVisible == true">
            <li v-for="(theme, name) in themes">
              <a
                class="item"
                :class="{ selected: selectedTheme == name }"
                :title="name"
                @click="selectTheme(name)"
              >
                <img :src="theme.thumbnail" />
              </a>
            </li>
          </ul>
        </a>
        <a class="item" @click="undo" title="Undo edit (Ctrl + Z)"><img :src="'../svg/undo.svg'"></a>
        <a class="item" @click="redo" title="Redo edit (Ctrl + Shift + Z)"><img :src="'../svg/redo.svg'"></a>
        <a class="item" @click="rewind" title="Restart level"><img :src="'../svg/rewind.svg'"></a>
        <a class="item" @click="pauseLevel" title="Pause level"><img :src="'../svg/pause.svg'"></a>
        <a class="item" @click="playCurrentLevel" title="Play level"><img :src="'../svg/play.svg'"></a>
        <a class="item auto" title="Play level" v-if="selectedObject">
          <input class="coordinates"
            v-model="coordinates"
            v-on:keyup.enter="$event.target.blur()"
            @change="updatePositionFromEvent($event)"
          >
        </a>
        <OriginButtonSettings class="item last" />
      </div>
    </div>
    <div class="row left" v-if="drawMode == 'draw' && objectTypeVisible == true">
      <div class="col object-type">
        <a class="item" :class="{ selected: objectType == 'cube' }" @click="selectObjectType({ detail: { type: 'cube' }})" title="Basic cube"><img :src="'../svg/cube.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'tip' }" @click="selectObjectType({ detail: { type: 'tip' }})" title="Tip cube"><img :src="'../svg/tip.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'bounce' }" @click="selectObjectType({ detail: { type: 'bounce' }})" title="Bounce cube"><img :src="'../svg/bounce.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'checkpoint' }" @click="selectObjectType({ detail: { type: 'checkpoint' }})" title="Checkpoint cube"><img :src="'../svg/checkpoint.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'spike' }" @click="selectObjectType({ detail: { type: 'spike' }})" title="Spike cube"><img :src="'../svg/spike.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'resize' }" @click="selectObjectType({ detail: { type: 'resize' }})" title="Resize cube"><img :src="'../svg/grow.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'direction' }" @click="selectObjectType({ detail: { type: 'direction' }})" title="Direction cube"><img :src="'../svg/direction.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'gravity' }" @click="selectObjectType({ detail: { type: 'gravity' }})" title="Gravity cube"><img :src="'../svg/gravity.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'grapple' }" @click="selectObjectType({ detail: { type: 'grapple' }})" title="Grapple cube"><img :src="'../svg/grapple.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'finish' }" @click="selectObjectType({ detail: { type: 'finish' }})" title="Finish cube"><img :src="'../svg/finish.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'reset' }" @click="selectObjectType({ detail: { type: 'reset' }})" title="Reset cube"><img :src="'../svg/reset.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'control' }" @click="selectObjectType({ detail: { type: 'control' }})" title="Control cube"><img :src="'../svg/control.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'power' }" @click="selectObjectType({ detail: { type: 'power' }})" title="Power cube"><img :src="'../svg/power.svg'"></a>
        <a class="item" :class="{ selected: objectType == 'teleport' }" @click="selectObjectType({ detail: { type: 'teleport' }})" title="Teleport cube"><img :src="'../svg/teleport.svg'"></a>
      </div>
      <div class="col object-options" v-if="selectedObject != null">
        <a class="item" :class="{ selected: selectedMode == 'translate'}" @click="setTransformMode({ detail: 'translate' })" title="Move (T or G)"><img :src="'../svg/move.svg'"></a>
        <a class="item" :class="{ selected: selectedMode == 'scale'}" @click="setTransformMode({ detail: 'scale' })" title="Scale (S)"><img :src="'../svg/scale-out-x.svg'"></a>
        <a class="item" :class="{ selected: selectedMode == 'rotate'}" @click="keydown({ code: 'KeyR' });" title="Rotate (R)"><img :src="'../svg/rotate-clockwise.svg'"></a>
        <a class="item" :class="{ selected: selectedMode == 'putty'}" @click="keydown({ code: 'KeyQ' });" title="Putty (Q)"><img :src="'../svg/putty.svg'"></a>
        <a class="item" :class="{ selected: selectedObject.isStatic() }" @click="toggleSelectedObjectStaticState" title="Pin"><img :src="'../svg/pin.svg'"></a>
        <a class="item" :class="{ disabled: selectedObject.isStatic() }" @click="toggleFriction" :title="`Friction (${ selectedObject.getFriction() })`"><img :src="'../svg/friction.svg'"></a>
        <a class="item" :class="{ disabled: selectedObject.textEnabled === false }" @click="changeText" title="Text"><img :src="'../svg/type.svg'"></a>
        <div class="item">
          <label>
            <a action="color" title="Color"><img :src="'../svg/color.svg'"></a>
            <input name="color" type="color" :value="selectedObject.color" @change="updateColor($event)">
          </label>
        </div>
        <a class="item" @click="duplicateSelectedObject" title="Duplicate (D)"><img :src="'../svg/duplicate.svg'"></a>
        <a class="item" @click="deleteSelectedObject" title="Delete (X)"><img :src="'../svg/trash.svg'"></a>
      </div>
    </div>
    <OriginControls />
  </div>
</template>