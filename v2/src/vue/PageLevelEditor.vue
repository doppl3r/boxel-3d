<script setup>
  import { onMounted } from 'vue';
  import LevelEditorPanelActions from './LevelEditorPanelActions.vue';
  import LevelEditorPanelScene from './LevelEditorPanelScene.vue';

  // Initialize app and expose to window scope
  const props = defineProps({
    game: Object
  });

  // Initialize app after canvas has been mounted
  onMounted(function() {
    
  });
</script>

<template>
  <div class="panels">
    <LevelEditorPanelActions />
    <LevelEditorPanelScene :entities="game.stage.physics.entities" />
  </div>
</template>

<style lang="scss" scoped>
  .panels {
    height: 100%;
    pointer-events: none;
    width: 100%;

    > * {
      pointer-events: all;
    }
  }
</style>