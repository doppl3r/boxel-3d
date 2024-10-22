<script setup>
  import { onMounted } from 'vue';
  import LevelEditorScene from './LevelEditorScene.vue';

  // Initialize app and expose to window scope
  const props = defineProps({
    game: Object
  });

  // Initialize app after canvas has been mounted
  onMounted(function() {
    
  });
</script>

<template>
  <LevelEditorScene :entities="props.game.stage.physics.entities" />
</template>

<style lang="scss" scoped>

</style>