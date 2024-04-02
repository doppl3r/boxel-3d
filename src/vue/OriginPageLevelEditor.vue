<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';

  var emit = defineEmits(['setPage']);
  var drawMode = ref('draw');
  var objectType = ref(app.levelEditor.selectedObjectType || 'cube');
  var objectTypeVisible = ref(true);
  var selectedObject = ref();
  var controlsTransform = ref(app.levelEditor.controlsTransform);
  var isClosed = ref(true); // Popup animation state

  function addEventListeners() {
    window.addEventListener('setSelectedObject', setSelectedObject);
    window.addEventListener('selectObjectType', selectObjectType);
    window.addEventListener('setTransformMode', setTransformMode);
    window.addEventListener('popupOpened', popupOpened);
    window.addEventListener('popupClosed', popupClosed);
    window.addEventListener('keydown', keydown);
  }
  
  function removeEventListeners() {
    window.removeEventListener('setSelectedObject', setSelectedObject);
    window.removeEventListener('selectObjectType', selectObjectType);
    window.removeEventListener('setTransformMode', setTransformMode);
    window.removeEventListener('popupOpened', popupOpened);
    window.removeEventListener('popupClosed', popupClosed);
    window.removeEventListener('keydown', keydown);
  }

  function popupOpened() {
    isClosed.value = false;
  }
  
  function popupClosed() {
    isClosed.value = true;
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

  function playLevel() {
    objectTypeVisible.value = false;
    app.playLevel();
  }

  function selectObjectType(e) {
    objectType.value = e.detail.type;
    app.levelEditor.selectObjectType(e.detail.type, e.detail.checkNull);
  }

  function setSelectedObject(e) {
    selectedObject.value = e.detail;
  }

  function toggleSelectedObjectStaticState() {
    app.levelEditor.toggleSelectedObjectStaticState();
  }

  function setTransformMode(e) {
    controlsTransform.value.mode = e.detail;
    app.levelEditor.setMode(e.detail);
  }

  function updateFriction(e) {
    selectedObject.value.setFriction(e.target.value);
    app.levelHistory.save('Updated object properties', app);
  }

  function changeText() {
    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openPopup', {
      detail: {
        text: 'Share a tip!',
        inputs: [
          { value: app.selectedObject.text, type: 'text', callback: updateText },
          { value: 'Cancel', type: 'button' },
          { value: 'Close', type: 'button' }
        ]
      }
    }));
  }

  function duplicateSelectedObject() {
    app.levelEditor.duplicateSelectedObject();
    setSelectedObject({ detail: app.selectedObject });
  }

  function deleteSelectedObject() {
    app.levelEditor.deleteSelectedObject();
  }

  function updateText(e) {
    app.selectedObject.text = e.target.value;
    app.levelHistory.save('Updated tip', app);
  }

  function keydown(e) {
    // Make sure popup is closed
    if (isClosed.value == true) {
      // Jump if one of the keys is pressed
      var jumpKeys = ['Space', 'Enter', 'ArrowUp', 'KeyW'];
      if (jumpKeys.indexOf(e.code) > -1) {
        app.player.jump();
      }

      // Add undo/redo logic
      if (e.code == 'Digit0') {
        app.levelEditor.resetZAxis();
      }
      else if (e.code == 'Escape' || e.code == 'KeyE') {
        e.preventDefault();
        if (app.play == true) pauseLevel();
        else exitLevel();
      }
      else if (e.code == 'KeyD') {
        duplicateSelectedObject();
      }
      else if (e.code == 'KeyG') {
        setTransformMode({ detail: 'translate' });
      }
      else if (e.code == 'KeyR') {
        if (app.play == true) app.level.retryLevel();
        else setTransformMode({ detail: 'rotate' });
      }
      else if (e.code == 'KeyS') {
        if (e.ctrlKey == true) {
          e.preventDefault();
          app.levelEditor.saveLevel();
        }
        else setTransformMode({ detail: 'scale' });
      }
      else if (e.code == 'KeyT') {
        setTransformMode({ detail: 'translate' });
      }
      else if (e.code == 'KeyX') {
        app.levelEditor.deleteSelectedObject();
      }
      else if (e.code == 'KeyZ') {
        if (e.ctrlKey == true && e.shiftKey == false) app.levelEditor.undo();
        if (e.ctrlKey == true && e.shiftKey == true) app.levelEditor.redo();
      }
    }
  }

  onMounted(function() {
    // Run function after being mounted (visible)
    app.canvas.classList.remove('hidden');
    addEventListeners();
  })

  onUnmounted(function() {
    // Run function after being unmounted (removed);
    app.canvas.classList.add('hidden');
    removeEventListeners();
  });
</script>

<template>
  <div class="level-editor">
    <div class="row top">
      <div class="col options-level">
        <a class="item" :class="{ selected: drawMode == 'draw' }" @click="setDrawMode('draw')" action="draw" title="Draw cubes"><img src="/img/svg/pencil.svg"></a>
        <a class="item" :class="{ selected: drawMode == 'erase' }" @click="setDrawMode('erase')" action="erase" title="Erase cubes"><img src="/img/svg/eraser.svg"></a>
        <a class="item" @click="exitLevel" title="Exit level editor (ESC)"><img src="/img/svg/home.svg"></a>
        <a class="item" @click="saveLevel" title="Save level (Ctrl + S)"><img src="/img/svg/save.svg"></a>
        <a class="item" @click="undo" title="Undo edit (Ctrl + Z)"><img src="/img/svg/undo.svg"></a>
        <a class="item" @click="redo" title="Redo edit (Ctrl + Shift + Z)"><img src="/img/svg/redo.svg"></a>
        <a class="item" @click="rewind" title="Restart level"><img src="/img/svg/rewind.svg"></a>
        <a class="item" @click="pauseLevel" title="Pause level"><img src="/img/svg/pause.svg"></a>
        <a class="item" @click="playLevel" title="Play level"><img src="/img/svg/play.svg"></a>
        <OriginButtonSettings class="item last" />
      </div>
    </div>
    <div class="row left" v-if="drawMode == 'draw' && objectTypeVisible == true">
      <div class="col object-type">
        <a class="item" :class="{ selected: objectType == 'cube' }" @click="selectObjectType({ detail: { type: 'cube' }})" title="Basic cube"><img src="/img/svg/cube.svg"></a>
        <a class="item" :class="{ selected: objectType == 'tip' }" @click="selectObjectType({ detail: { type: 'tip' }})" title="Tip cube"><img src="/img/svg/tip.svg"></a>
        <a class="item" :class="{ selected: objectType == 'bounce' }" @click="selectObjectType({ detail: { type: 'bounce' }})" title="Bounce cube"><img src="/img/svg/bounce.svg"></a>
        <a class="item" :class="{ selected: objectType == 'checkpoint' }" @click="selectObjectType({ detail: { type: 'checkpoint' }})" title="Checkpoint cube"><img src="/img/svg/checkpoint.svg"></a>
        <a class="item" :class="{ selected: objectType == 'spike' }" @click="selectObjectType({ detail: { type: 'spike' }})" title="Spike cube"><img src="/img/svg/spike.svg"></a>
        <a class="item" :class="{ selected: objectType == 'resize' }" @click="selectObjectType({ detail: { type: 'resize' }})" title="Resize cube"><img src="/img/svg/grow.svg"></a>
        <a class="item" :class="{ selected: objectType == 'direction' }" @click="selectObjectType({ detail: { type: 'direction' }})" title="Direction cube"><img src="/img/svg/direction.svg"></a>
        <a class="item" :class="{ selected: objectType == 'gravity' }" @click="selectObjectType({ detail: { type: 'gravity' }})" title="Gravity cube"><img src="/img/svg/gravity.svg"></a>
        <a class="item" :class="{ selected: objectType == 'grapple' }" @click="selectObjectType({ detail: { type: 'grapple' }})" title="Grapple cube"><img src="/img/svg/grapple.svg"></a>
        <a class="item" :class="{ selected: objectType == 'finish' }" @click="selectObjectType({ detail: { type: 'finish' }})" title="Finish cube"><img src="/img/svg/finish.svg"></a>
        <a class="item" :class="{ selected: objectType == 'reset' }" @click="selectObjectType({ detail: { type: 'reset' }})" title="Reset cube"><img src="/img/svg/reset.svg"></a>
      </div>
      <div class="col object-options" v-if="selectedObject != null">
        <a class="item" :class="{ selected: controlsTransform.mode == 'translate'}" @click="setTransformMode({ detail: 'translate' })" title="Move (T or G)"><img src="/img/svg/move.svg"></a>
        <a class="item" :class="{ selected: controlsTransform.mode == 'scale'}" @click="setTransformMode({ detail: 'scale' })" title="Scale (S)"><img src="/img/svg/scale-out-x.svg"></a>
        <a class="item" :class="{ selected: controlsTransform.mode == 'rotate'}" @click="setTransformMode({ detail: 'rotate' })" title="Rotate (R)"><img src="/img/svg/rotate-clockwise.svg"></a>
        <a class="item" :class="{ selected: selectedObject.isStatic() }" @click="toggleSelectedObjectStaticState" title="Pin"><img src="/img/svg/pin.svg"></a>
        <div class="item" :class="{ disabled: selectedObject.isStatic() }">
          <a action="friction" title="Friction"><img src="/img/svg/friction.svg"></a>
          <div class="slider"><input name="friction" type="range" min="0" max="1" step="0.25" :value="selectedObject.body.friction" @change="updateFriction($event)"></div>
        </div>
        <a class="item" :class="{ disabled: selectedObject.text == null }" @click="changeText" title="Text"><img src="/img/svg/type.svg"></a>
        <a class="item" @click="duplicateSelectedObject" title="Duplicate (D)"><img src="/img/svg/duplicate.svg"></a>
        <a class="item" @click="deleteSelectedObject" title="Delete (X)"><img src="/img/svg/trash.svg"></a>
      </div>
    </div>
  </div>
</template>