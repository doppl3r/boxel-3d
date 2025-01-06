<script setup>
  var props = defineProps(['tab']);
</script>

<template>
  <div class="tabs">
    <div class="tab" :class="{ 'selected': tab == 'audio' }" @click="$emit('changeTab', 'audio');">
      <label>Audio</label>
      <span class="material-symbols-rounded">volume_up</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'graphics' }" @click="$emit('changeTab', 'graphics');">
      <label>Graphics</label>
      <span class="material-symbols-rounded">visibility</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'multiplayer' }" @click="$emit('changeTab', 'multiplayer');">
      <label>Multiplayer</label>
      <span class="material-symbols-rounded">group</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'mods' }" @click="$emit('changeTab', 'mods');">
      <label>Mods</label>
      <span class="material-symbols-rounded">power</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'data' }" @click="$emit('changeTab', 'data');">
      <label>Data</label>
      <span class="material-symbols-rounded">save</span>
    </div>
  </div>
</template>