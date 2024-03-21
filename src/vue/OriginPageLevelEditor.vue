<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';

  var emit = defineEmits(['setPage']);
  var drawMode = ref('draw');
  var objectOptionsVisible = ref(false);
  var objectTypeVisible = ref(true);
  var objectType = ref(app.levelEditor.selectedObjectType || 'cube');
  var objectData = ref({});

  function addEventListeners() {
    window.addEventListener('updateObjectOptions', updateObjectOptions);
    window.addEventListener('selectObjectType', selectObjectType);
  }

  function removeEventListeners() {
    window.removeEventListener('updateObjectOptions', updateObjectOptions);
    window.removeEventListener('selectObjectType', selectObjectType);
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
    objectTypeVisible.value = true;
    app.levelEditor.rewind();
  }

  function pauseLevel() {
    objectTypeVisible.value = true;
    app.pauseLevel();
  }

  function playLevel() {
    objectTypeVisible.value = false;
    app.playLevel();
  }

  function selectObjectType(e) {
    objectType.value = e.detail.type;
    app.levelEditor.selectObjectType(e.detail.type);
  }

  function updateObjectOptions(e) {
    objectOptionsVisible.value = (e.detail != null);
    console.log(e.detail);
  }

  onMounted(function() {
    // Run function after being mounted (visible)
    addEventListeners();

    app.ui.updateLevelOptions();
    app.ui.objectType.find('[action="cube"]').addClass('selected'); // Select by default
    app.ui.canvas.removeClass('hidden');
    app.ui.levelEditor.removeClass('hidden');
  })

  onUnmounted(function() {
    // Run function after being unmounted (removed);
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
      <div class="col object-options" v-if="objectOptionsVisible == true">
        <a class="item" action="translate" title="Move (T or G)"><img src="/img/svg/move.svg"></a>
        <a class="item" action="scale" title="Scale (S)"><img src="/img/svg/scale-out-x.svg"></a>
        <a class="item" action="rotate" title="Rotate (R)"><img src="/img/svg/rotate-clockwise.svg"></a>
        <div class="item">
          <a action="friction" title="Friction"><img src="/img/svg/friction.svg"></a>
          <div class="slider"><input name="friction" type="range" min="0" max="1" step="0.25" value="0"></div>
        </div>
        <a class="item" action="text" title="Text"><img src="/img/svg/type.svg"></a>
        <a class="item" action="duplicate" title="Duplicate (D)"><img src="/img/svg/duplicate.svg"></a>
        <a class="item" action="pin" title="Pin"><img src="/img/svg/pin.svg"></a>
        <a class="item" action="trash" title="Delete (X)"><img src="/img/svg/trash.svg"></a>
      </div>
    </div>
  </div>
</template>