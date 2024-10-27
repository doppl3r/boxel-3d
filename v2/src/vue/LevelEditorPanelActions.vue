<script setup>
  import { onMounted, ref } from 'vue';

  const mode = ref('select');

  function setMode(newMode) {
    mode.value = newMode;
  }
  
  // Initialize app after canvas has been mounted
  onMounted(function() {
    
  });
</script>

<template>
  <div class="panel actions">
    <div class="action button" :class="{ selected: mode == 'add' }" @click="setMode('add')" title="Add">
      <span class="material-symbols-rounded">dashboard_customize</span>
    </div>
    <div class="action button" :class="{ selected: mode == 'select' }" @click="setMode('select')" title="Select">
      <span class="material-symbols-rounded">arrow_selector_tool</span>
    </div>
    <div class="action button" :class="{ selected: mode == 'move' }" @click="setMode('move')" title="Move camera">
      <span class="material-symbols-rounded">back_hand</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    position: absolute;
    left: 1em;
    top: 1em;
    
    .action {
      align-items: center;
      background-color: #000000;
      border: 0.25em solid #000000;
      border-radius: 0.5em;
      box-shadow: 0 0.25em 0 #000000;
      color: #ffffff;
      display: flex;
      justify-content: center;
      width: 2em;
      height: 2em;

      &:hover,
      &.selected {
        background-color: #FFCB4C;
        color: #000000;
      }
    }
  }
</style>