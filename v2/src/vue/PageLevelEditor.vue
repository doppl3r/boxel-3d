<script setup>
  import { onMounted, ref } from 'vue';
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
  <LevelEditorScene :game="props.game" />
</template>

<style lang="scss" scoped>

</style>