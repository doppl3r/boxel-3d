<script setup>
  import { ref } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';
</script>

<template>
  <div class="level-editor hidden">
    <div class="row top">
      <div class="col options-level">
        <a class="item" action="draw" title="Draw cubes"><img src="/img/svg/pencil.svg"></a>
        <a class="item" action="erase" title="Erase cubes"><img src="/img/svg/eraser.svg"></a>
        <a class="item" action="exit-to-level-manager" title="Exit level editor (ESC)"><img src="/img/svg/home.svg"></a>
        <a class="item" action="save" title="Save level (Ctrl + S)"><img src="/img/svg/save.svg"></a>
        <a class="item" action="share" title="Share level"><img src="/img/svg/upload.svg"></a>
        <a class="item" action="undo" title="Undo edit (Ctrl + Z)"><img src="/img/svg/undo.svg"></a>
        <a class="item" action="redo" title="Redo edit (Ctrl + Shift + Z)"><img src="/img/svg/redo.svg"></a>
        <a class="item" action="rewind" title="Restart level"><img src="/img/svg/rewind.svg"></a>
        <a class="item" action="pause" title="Pause level"><img src="/img/svg/pause.svg"></a>
        <a class="item" action="play" title="Play level"><img src="/img/svg/play.svg"></a>
        <OriginButtonSettings class="item" />
      </div>
    </div>
    <div class="row left">
      <div class="col object-type">
        <a class="item" action="cube" title="Basic cube"><img src="/img/svg/cube.svg"></a>
        <a class="item" action="tip" title="Tip cube"><img src="/img/svg/tip.svg"></a>
        <a class="item" action="bounce" title="Bounce cube"><img src="/img/svg/bounce.svg"></a>
        <a class="item" action="checkpoint" title="Checkpoint cube"><img src="/img/svg/checkpoint.svg"></a>
        <a class="item" action="spike" title="Spike cube"><img src="/img/svg/spike.svg"></a>
        <a class="item" action="resize" title="Resize cube"><img src="/img/svg/grow.svg"></a>
        <a class="item" action="direction" title="Direction cube"><img src="/img/svg/direction.svg"></a>
        <a class="item" action="gravity" title="Gravity cube"><img src="/img/svg/gravity.svg"></a>
        <a class="item" action="grapple" title="Grapple cube"><img src="/img/svg/grapple.svg"></a>
        <a class="item" action="finish" title="Finish cube"><img src="/img/svg/finish.svg"></a>
        <a class="item" action="reset" title="Reset cube"><img src="/img/svg/reset.svg"></a>
      </div>
      <div class="col object-options hidden">
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