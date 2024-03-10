<script setup>
  import { ref } from 'vue';
</script>

<template>
  <div class="skins dashboard hidden">
    <div class="background"></div>
    <div class="wrapper fade-in">
      <h1>My<strong>Skins</strong></h1>
      <div class="skin-group"></div>
      <div class="buttons">
        <a class="button top-left" action="exit-to-home" title="Exit to home (ESC)" tabindex="0"><img src="/img/svg/home.svg"></a>
      </div>
    </div>
  </div>
</template>