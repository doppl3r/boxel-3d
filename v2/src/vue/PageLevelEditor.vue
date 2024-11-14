<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import { History } from '../js/History';
  import PanelActions from './PanelActions.vue';
  import PanelAssets from './PanelAssets.vue';
  import PanelScene from './PanelScene.vue';
  import ContextMenu from './ContextMenu.vue';

  // Initialize app and expose to window scope
  const props = defineProps({ game: Object });
  const mode = ref({ type: 'select' });
  const entities = ref([]);
  const history = window.his = new History();

  function setMode(newMode) {
    mode.value = newMode;
  }

  function addEntity(e) {
    console.log(e);
  }

  function deleteEntity(e, ent) {
    const entity = props.game.physics.get(ent.rigidBody.handle);
    const index = entities.value.indexOf(ent);

    const command = {
      run: function() {
        props.game.physics.remove(entity);
        entities.value.splice(index, 1);
      },
      undo: function() {
        props.game.physics.add(entity);
        entities.value.splice(index, 0, entity);
      }
    }
    
    command.run();
    history.add(command);
  }

  function moveEntity(e, entity1, entity2) {
    const index1 = entities.value.indexOf(entity1);
    const index2 = entities.value.indexOf(entity2);
    const order = (index1 > index2 ? 1 : 0);

    entities.value.splice(index1, 1); // Remove entity1 from current index;
    entities.value.splice(index2 + order, 0, entity1); // Insert entity1 below entity2 index
  }

  function renameEntity(e, entity) {
    entity.name = e.target.value;
  }

  function onKeyUp(e) {
    if (e.key == 'z' && e.ctrlKey == true) {
      history.undo().undo();
    }
  }

  // Initialize app after canvas has been mounted
  onMounted(async function() {
    entities.value = await game.loadLevel('../json/boxel-3d-sandbox.json');
    document.addEventListener('keyup', onKeyUp);
  });

  onUnmounted(function() {
    document.removeEventListener('keyup', onKeyUp);
  });
</script>

<template>
  <div>
    <div class="panels">
      <PanelActions :game="game" :mode="mode" @setMode="setMode" />
      <PanelAssets :game="game" :mode="mode" />
      <PanelScene
        :entities="entities"
        @add-entity="addEntity"
        @delete-entity="deleteEntity"
        @move-entity="moveEntity"
        @rename-entity="renameEntity"
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