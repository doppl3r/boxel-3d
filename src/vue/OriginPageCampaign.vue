<script setup>
  import { ref } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';
</script>

<template>
  <div class="campaign dashboard hidden">
    <div class="background"></div>
    <div id="timer"></div>
    <div id="credit"></div>
    <div id="speedometer"><span id="speed"></span></div>
    <div class="buttons">
      <a class="button top-left" action="pause-campaign" title="Pause (ESC)"><img src="/img/svg/pause.svg"></a>
      <OriginButtonSettings class="button top-right" />
    </div>
  </div>
</template>