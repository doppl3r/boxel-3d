<script setup>
  import { onMounted, ref } from 'vue';
  import PanelActions from './PanelActions.vue';
  import PanelAssets from './PanelAssets.vue';
  import PanelScene from './PanelScene.vue';
  import ContextMenu from './ContextMenu.vue';

  // Initialize app and expose to window scope
  const props = defineProps({ game: Object });
  const mode = ref({ type: 'select' });

  function setMode(newMode) {
    mode.value = newMode;
  }

  // Initialize app after canvas has been mounted
  onMounted(function() {
    game.loadLevel('../json/boxel-3d-sandbox.json');
    game.graphics.fog.color.set('#222222');
    game.graphics.fog.near = 10;
    game.graphics.fog.far = 50;
  });
</script>

<template>
  <div>
    <div class="panels">
      <PanelActions :game="game" :mode="mode" @setMode="setMode" />
      <PanelAssets :game="game" :mode="mode" />
      <PanelScene :game="game" />
    </div>
    <ContextMenu :game="game" />
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