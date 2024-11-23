<script setup>
  import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
  import { History } from '../js/CommandHistory';
  import PanelActions from './PanelActions.vue';
  import PanelAssets from './PanelAssets.vue';
  import PanelScene from './PanelScene.vue';

  // Initialize app and expose to window scope
  const props = defineProps({ game: Object });
  const mode = ref({ type: 'select' });
  const entities = ref([]);
  const entityPrev = ref({});
  const entitiesSelected = reactive([]);
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
    // Store an array of selected entities with their current index
    const selected = entitiesSelected.map(item => {
      return {
        index: entities.value.indexOf(item),
        entity: item
      }
    }).sort((a, b) => a.index - b.index);

    // Add delete or revert commands
    history.add(
      function() {
        for (let i = selected.length - 1; i >= 0; i--) {
          const item = selected[i];
          props.game.physics.remove(item.entity);
          entities.value.splice(item.index, 1);
        }
      },
      function() {
        for (let i = 0; i < selected.length; i++) {
          const item = selected[i];
          props.game.physics.add(item.entity);
          entities.value.splice(item.index, 0, item.entity);
        }
      }
    ).execute();
  }

  function deselectEntity(e, entity) {
    const index = entitiesSelected.indexOf(entity);
    entity.isSelected = false;
    entitiesSelected.splice(index, 1);
  }

  function deselectAllEntities(e) {
    for (let i = entitiesSelected.length - 1; i >= 0; i--) {
      deselectEntity(e, entitiesSelected[i]);
    }
  }

  function moveEntity(e, entity) {
    // Prevent moving items to self
    if (entity.isSelected) return;

    // Store an array of selected entities with their current index
    const selected = entitiesSelected.map(item => {
      return {
        index: entities.value.indexOf(item),
        entity: item
      }
    }).sort((a, b) => a.index - b.index);

    // Add move or remove commands
    history.add(
      function() {
        // Remove selected entities
        for (let i = selected.length - 1; i >= 0; i--) {
          entities.value.splice(selected[i].index, 1); // Remove entity
        }

        // Insert selected entities to entity index
        const index = entities.value.indexOf(entity) + 1;
        for (let i = 0; i < selected.length; i++) {
          entities.value.splice(index + i, 0, selected[i].entity);
        }
      },
      function() {
        // Remove selected entities below entity index
        const index = entities.value.indexOf(entity) + 1;
        for (let i = selected.length - 1; i >= 0; i--) {
          entities.value.splice(index + i, 1);
        }

        // Insert selected entities back to their original index
        for (let i = 0; i < selected.length; i++) {
          entities.value.splice(selected[i].index, 0, selected[i].entity);
        }
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
    // Initialize indexes
    let indexEntityPrev = entities.value.indexOf(entityPrev.value);
    let indexEntityNext = entities.value.indexOf(entity);
    let indexLoopStart = indexEntityNext;
    let indexLoopEnd = indexEntityNext;

    // Update start index if shift key is true
    if (e.shiftKey == true) {
      indexLoopEnd = Math.max(indexEntityNext, indexEntityPrev); // Set <= previous entity index
      indexLoopStart = Math.max(0, Math.min(Math.min(indexEntityNext, indexEntityPrev), indexLoopEnd)); // Clamp min >= 0
    }
    else {
      // Store previously selected entity for shift click
      entityPrev.value = entity;
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
      deselectAllEntities(e);
    }

    // Add entities to selected array and set selected boolean
    for (let i = indexLoopStart; i <= indexLoopEnd; i++) {
      entities.value[i].isSelected = true;
      entitiesSelected.push(entities.value[i]);
    }
  }

  function selectAllEntities(e) {
    let entityStart = entities.value[0];
    let entityEnd = entities.value[entities.value.length - 1];
    entityPrev.value = entityStart;
    selectEntity({ shiftKey: true }, entityEnd);
  }

  function linkEntity(e, entity) {
    console.log(entity);
  }

  function unlinkEntity(e, entity) {
    console.log(entity);
  }

  function onKeyDown(e) {
    if (e.repeat) return;
    if (e.code == 'KeyA' && e.ctrlKey) {
      e.preventDefault();
      selectAllEntities(e);
    }
    else if (e.code == 'KeyD' && e.ctrlKey) {
      e.preventDefault();
      deselectAllEntities(e);
    }
    else if (e.code == 'KeyX' && e.ctrlKey) deleteEntity(e);
    else if (e.code == 'KeyZ' && e.ctrlKey) {
      if (e.shiftKey == true) redo();
      else undo();
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
        @link-entity="linkEntity"
        @move-entity="moveEntity"
        @rename-entity="renameEntity"
        @select-entity="selectEntity"
        @unlink-entity="unlinkEntity"
        @redo="redo"
        @undo="undo"
      />
    </div>
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