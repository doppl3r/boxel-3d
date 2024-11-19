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
  const entitiesSelected = reactive([]);
  const entitySelected = ref({});
  const history = reactive(new History());
  const canUndo = computed(() => history.canUndo());
  const canRedo = computed(() => history.canRedo());

  function setMode(newMode) {
    mode.value = newMode;
  }

  function addEntity(e) {
    console.log(e);
  }

  function deleteEntity(e, entity) {
    const index = entities.value.indexOf(entity);
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
    const before = entity.name || entity.type;
    const after = e.target.value;
    history.add(
      function() {
        entity.name = after;
      },
      function() {
        entity.name = before;
      }
    ).execute();
  }

  function selectEntity(e, entity) {
    // Store last entity before deselecting entities
    let indexStart = entities.value.indexOf(entity);
    let indexEnd = indexStart;

    // Update start index if shift key is true
    if (e.shiftKey == true) {
      indexStart = entities.value.indexOf(entitySelected.value);
      if (indexStart == -1) indexStart = 0;
      if (indexStart > indexEnd) {
        indexEnd = indexStart;
        indexStart = entities.value.indexOf(entity);
      }
    }
    else {
      // Store selected entity for shift click
      entitySelected.value = entity;
    }

    // Deselect selected entity
    if (e.ctrlKey == true) {
      if (entity.isSelected) {
        deselectEntity(e, entity);
        return; // Cancel selection
      }
    }
    else {
      // Deselect all entities before selecting new entity
      for (let i = entitiesSelected.length - 1; i >= 0; i--) {
        deselectEntity(e, entitiesSelected[i]);
      }
    }

    // Add entities to selected array and set selected boolean
    for (let i = indexStart; i <= indexEnd; i++) {
      entities.value[i].isSelected = true;
      entitiesSelected.push(entities.value[i]);
    }
  }

  function deselectEntity(e, entity) {
    const index = entitiesSelected.indexOf(entity);
    entity.isSelected = false;
    entitiesSelected.splice(index, 1);
  }

  function onKeyDown(e) {
    if (e.repeat) return;
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
        @select-entity="selectEntity"
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