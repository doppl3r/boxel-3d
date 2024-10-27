<script setup>
  import { onMounted, ref } from 'vue';
  import LevelEditorPanelActions from './LevelEditorPanelActions.vue';
  import LevelEditorPanelAssets from './LevelEditorPanelAssets.vue';
  import LevelEditorPanelScene from './LevelEditorPanelScene.vue';

  // Initialize app and expose to window scope
  const props = defineProps({ game: Object });
  const mode = ref({ type: 'select' });

  function setMode(newMode) {
    mode.value = newMode;
  }

  // Initialize app after canvas has been mounted
  onMounted(function() {
    
  });
</script>

<template>
  <div class="panels">
    <LevelEditorPanelActions :mode="mode" @setMode="setMode" />
    <LevelEditorPanelAssets :mode="mode" />
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