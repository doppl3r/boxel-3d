<script setup>
  import { onMounted } from 'vue';

  const emit = defineEmits(['setMode'])
  const props = defineProps({
    game: Object,
    mode: Object
  });

  function selectAction(mode) {
    emit('setMode', { type: mode });
  }
  
  // Initialize app after canvas has been mounted
  onMounted(function() {
    
  });
</script>

<template>
  <div class="panel">
    <div class="actions">
      <button class="action" :class="{ selected: mode.type == 'select' }" @click="selectAction('select')" title="Select">
        <span class="material-symbols-rounded">arrow_selector_tool</span>
      </button>
      <button class="action" :class="{ selected: mode.type == 'add' }" @click="selectAction('add')" title="Add">
        <span class="material-symbols-rounded">dashboard_customize</span>
      </button>
      <button class="action" :class="{ selected: mode.type == 'move' }" @click="selectAction('move')" title="Move camera">
        <span class="material-symbols-rounded">back_hand</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .panel {
    position: absolute;
    left: 1em;
    top: 1em;
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.5em;

      .action {
        align-items: center;
        background-color: #000000;
        border: 0.25em solid #000000;
        border-radius: 0.5em;
        box-shadow: 0 0.25em 0 #000000;
        color: #ffffff;
        cursor: pointer;
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
  }
</style>