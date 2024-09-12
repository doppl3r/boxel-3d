<script setup>
  var props = defineProps(['tab']);
</script>

<template>
  <div class="tabs">
    <div class="tab" :class="{ 'selected': tab == 'graphics' }" @click="$emit('changeTab', 'graphics');">
      <span class="material-symbols-rounded">page_info</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'multiplayer' }" @click="$emit('changeTab', 'multiplayer');">
      <span class="material-symbols-rounded">group</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'gameplay' }" @click="$emit('changeTab', 'gameplay');">
      <span class="material-symbols-rounded">gamepad</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'audio' }" @click="$emit('changeTab', 'audio');">
      <span class="material-symbols-rounded">volume_up</span>
    </div>
    <div class="tab" :class="{ 'selected': tab == 'data' }" @click="$emit('changeTab', 'data');">
      <span class="material-symbols-rounded">save</span>
    </div>
  </div>
</template>