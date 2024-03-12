<script setup>
  import { ref, onMounted } from 'vue';

  // Run function after being mounted (visible)
  onMounted(function() {
    window.app.skins.getSkins(); // Gets skins
  })
</script>

<template>
  <div class="skins dashboard">
    <div class="background"></div>
    <div class="wrapper fade-in">
      <h1>My<strong>Skins</strong></h1>
      <div class="skin-group"></div>
      <div class="buttons">
        <a class="button top-left" @click="$emit('setPage', 'home')" title="Exit to home (ESC)"><img src="/img/svg/home.svg"></a>
      </div>
    </div>
  </div>
</template>