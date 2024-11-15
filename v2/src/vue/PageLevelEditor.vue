<script setup>
  import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
  import { History } from '../js/CommandHistory';
  import PanelActions from './PanelActions.vue';
  import PanelAssets from './PanelAssets.vue';
  import PanelScene from './PanelScene.vue';
  import ContextMenu from './ContextMenu.vue';

  // Initialize app and expose to window scope
  const props = defineProps({ game: Object });
  const mode = ref({ type: 'select' });
  const entities = ref([]);
  const history = reactive(new History());
  const canUndo = computed(() => history.canUndo());
  const canRedo = computed(() => history.canRedo());

  function setMode(newMode) {
    mode.value = newMode;
  }

  function addEntity(e) {
    console.log(e);
  }

  function deleteEntity(e, ent) {
    const entity = props.game.physics.get(ent.rigidBody.handle);
    const index = entities.value.indexOf(ent);
    history.add(
      function() {
        props.game.physics.remove(entity);
        entities.value.splice(index, 1);
      },
      function() {
        props.game.physics.add(entity);
        entities.value.splice(index, 0, entity);
      }
    ).execute();
  }

  function moveEntity(e, entity1, entity2) {
    const index1 = entities.value.indexOf(entity1);
    const index2 = entities.value.indexOf(entity2);
    const order = (index1 > index2 ? 1 : 0);

    history.add(
      function() {
        entities.value.splice(index1, 1); // Remove entity
        entities.value.splice(index2 + order, 0, entity1); // Insert entity
      },
      function() {
        entities.value.splice(index2 + order, 1); // Remove entity
        entities.value.splice(index1, 0, entity1); // Insert entity
      }
    ).execute();
  }

  function renameEntity(e, entity) {
    entity.name = e.target.value;
  }

  function onKeyDown(e) {
    if (e.code == 'KeyZ') {
      if (e.ctrlKey == true) {
        if (e.shiftKey == true) redo();
        else undo();
      }
    }
  }

  function undo() {
    history.undo();
  }

  function redo() {
    history.redo();
  }

  // Initialize app after canvas has been mounted
  onMounted(async function() {
    entities.value = await game.loadLevel('../json/boxel-3d-sandbox.json');
    document.addEventListener('keydown', onKeyDown);
  });

  onUnmounted(function() {
    document.removeEventListener('keydown', onKeyDown);
  });
</script>

<template>
  <div>
    <div class="panels">
      <PanelActions :game="game" :mode="mode" @setMode="setMode" />
      <PanelAssets :game="game" :mode="mode" />
      <PanelScene
        :entities="entities"
        :canUndo="canUndo"
        :canRedo="canRedo"
        @add-entity="addEntity"
        @delete-entity="deleteEntity"
        @move-entity="moveEntity"
        @rename-entity="renameEntity"
        @redo="redo"
        @undo="undo"
      />
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