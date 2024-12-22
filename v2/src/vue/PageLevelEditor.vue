<script setup>
  import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  import { computed, onMounted, onUnmounted, shallowReactive, ref } from 'vue';
  import { EntityFactory } from '../js/factories/EntityFactory.js';
  import { History } from '../js/core/CommandHistory';
  import { CameraFactory } from '../js/core/factories/CameraFactory';
  import PanelActions from './PanelActions.vue';
  import PanelPrefabs from './PanelPrefabs.vue';
  import PanelScene from './PanelScene.vue';
  import ContextMenu from './ContextMenu.vue';
  import CustomEvents from '../js/mixins/CustomEvents.js';

  // Initialize app and expose to window scope
  const props = defineProps({ game: Object });
  const mode = ref({ type: 'select' });
  const entities = ref([]);
  const entityPrev = ref({});
  const entitiesSelected = [];
  const history = shallowReactive(new History());
  const ticker = shallowReactive(props.game.ticker);
  const canUndo = computed(() => history.canUndo());
  const canRedo = computed(() => history.canRedo());
  const isPlaying = computed(() => ticker.isRunning());
  const contextMenuEvent = ref({});
  const contextMenuActions = ref([]);
  const controlsTransform = new TransformControls(props.game.graphics.camera, props.game.graphics.canvas);
  const controlsOrbit = new OrbitControls(CameraFactory.create(), props.game.graphics.canvas);
  controlsOrbit.zoomToCursor = true;
  controlsOrbit.zoomSpeed = 3;
  controlsOrbit.minDistance = 1;
  controlsOrbit.maxDistance = 100;
  controlsOrbit.mouseButtons = { LEFT: 2, MIDDLE: 2, RIGHT: 2 };
  enableControlsOrbit(false);

  function setMode(newMode) {
    mode.value = newMode;
  }

  function editEntity(e, entity) {
    console.log(e, entity);
  }

  function addEntity(e, prefab) {
    // Store an array of selected entities with their current index
    const position = {
      x: Math.round(props.game.graphics.camera.position.x),
      y: Math.round(props.game.graphics.camera.position.y),
      z: 0,
    };
    const entity = EntityFactory.create({ ...prefab, position });
    const last = entitiesSelected[entitiesSelected.length - 1];
    const index = last ? entities.value.indexOf(last) + 1 : 0;

    // Add 3D object after entity is added
    entity.addEventListener('added', function(e) {
      props.game.graphics.scene.add(entity.object);
    });

    // Add custom mixin functions to entity
    Object.assign(entity, CustomEvents);
    
    // Add or remove entity to/from end
    history.add(
      function() {
        props.game.physics.add(entity);
        entities.value.splice(index, 0, entity);
        selectEntity(e, entity);
        updateDebugger();
      },
      function() {
        props.game.physics.remove(entity);
        entities.value.splice(index, 1);
        deselectEntity(e, entity);
        updateDebugger();
      }
    ).execute();
  }

  function deleteEntity(e, entity) {
    // Store an array of selected entities with their current index
    const selected = entitiesSelected.map(item => {
      return {
        children: props.game.physics.getChildren(item),
        index: entities.value.indexOf(item),
        entity: item
      }
    }).sort((a, b) => a.index - b.index);

    // Add delete or revert commands
    if (selected.length > 0) {
      history.add(
        function() {
          for (let i = selected.length - 1; i >= 0; i--) {
            const item = selected[i];
            props.game.physics.remove(item.entity);
            entities.value.splice(item.index, 1);
            deselectEntity(e, item.entity, i);
            updateDebugger();
          }
        },
        function() {
          for (let i = 0; i < selected.length; i++) {
            const item = selected[i];
            item.children.forEach(child => child.setParentId(item.entity.id));
            props.game.physics.add(item.entity);
            entities.value.splice(item.index, 0, item.entity);
            updateDebugger();
          }
        }
      ).execute();
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
      deselectAllEntities(e, entity);
    }

    // Add entities to selected array and set selected boolean
    for (let i = indexLoopStart; i <= indexLoopEnd; i++) {
      entities.value[i].isSelected = true;
      entitiesSelected.push(entities.value[i]);
    }
  }

  function selectParentEntity(e, entity) {
    const parentId = entity.getParentId();
    const parent = props.game.physics.getEntityById(parentId);
    if (parent) {
      selectEntity(e, parent);
    }
  }

  function selectAllEntities(e) {
    let entityStart = entities.value[0];
    let entityEnd = entities.value[entities.value.length - 1];
    entityPrev.value = entityStart;
    selectEntity({ shiftKey: true }, entityEnd);
  }

  function deselectEntity(e, entity, index) {
    if (index == null) index = entitiesSelected.indexOf(entity);
    entity.isSelected = false;
    entitiesSelected.splice(index, 1);
  }

  function deselectAllEntities(e, entity) {
    for (let i = entitiesSelected.length - 1; i >= 0; i--) {
      // Prevent deselecting entity if provided
      deselectEntity(e, entitiesSelected[i], i);
    }
  }

  function resetEntities(e) {
    entities.value.forEach(entity => {
      entity.reset();
    });
    props.game.graphics.render();
  }

  function linkEntity(e, entity) {
    // Store an array of selected entities with their current index
    const selected = entitiesSelected.map(item => {
      return {
        index: entities.value.indexOf(item),
        parentId: item.getParentId(),
        entity: item
      }
    }).sort((a, b) => a.index - b.index);
    
    // Assign or unassign to top selected item
    if (selected.length > 0) {
      history.add(
        function() {
          // Ignore first item (zero index)
          for (let i = selected.length - 1; i >= 0; i--) {
            const item = selected[i];
            if (item.entity.id != entity.id) {
              props.game.physics.removeParentJoint(item.entity);
              item.entity.setParentId(entity.id);
              props.game.physics.createParentJoint(item.entity)
              updateDebugger();
            }
          }
        },
        function() {
          // Ignore first item (zero index)
          for (let i = 0; i < selected.length; i++) {
            const item = selected[i];
            if (item.entity.id != entity.id) {
              props.game.physics.removeParentJoint(item.entity);
              item.entity.setParentId(item.parentId);
              props.game.physics.createParentJoint(item.entity)
              updateDebugger();
            }
          }
        }
      ).execute();
    }
  }

  function unlinkEntity(e, entity) {
    // Store an array of selected entities with their current index
    const selected = entitiesSelected.map(item => {
      return {
        entity: item,
        parentId: item.getParentId()
      }
    });

    // Unassign or assign parent
    if (selected.length > 0) {
      history.add(
        function() {
          for (let i = selected.length - 1; i >= 0; i--) {
            const item = selected[i];
            props.game.physics.removeParentJoint(item.entity);
            item.entity.setParentId(null);
            updateDebugger();
          }
        },
        function() {
          for (let i = 0; i < selected.length; i++) {
            const item = selected[i];
            props.game.physics.removeParentJoint(item.entity);
            item.entity.setParentId(item.parentId);
            props.game.physics.createParentJoint(item.entity);
            updateDebugger();
          }
        }
      ).execute();
    }
  }

  function onKeyDown(e) {
    if (e.repeat) return;
    if (e.code == 'KeyA' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      selectAllEntities(e);
    }
    else if (e.code == 'KeyD' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      deselectAllEntities(e);
    }
    else if (e.code == 'KeyX' && (e.ctrlKey || e.metaKey)) deleteEntity(e);
    else if (e.code == 'KeyZ' && (e.ctrlKey || e.metaKey)) {
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

  function loadLevel(name) {
    // Reset physics entities
    props.game.physics.clear();
    
    // Load level from JSON
    const json = props.game.assets.get(name);
    const entities = [];
    
    // Loop through level children
    if (json) {
      json.children.forEach(function(child) {
        const entity = EntityFactory.create({
          ccd: true,
          friction: json.friction || 0,
          softCcdPrediction: 0.5,
          ...child,
        });
  
        // Add 3D object after entity is added
        entity.addEventListener('added', function(e) {
          props.game.graphics.scene.add(entity.object);
        });
  
        // Add custom mixin functions to entity
        Object.assign(entity, CustomEvents);
  
        // Assign rendering camera from player
        if (entity.type == 'player') {
          props.game.player = entity;
          props.game.graphics.setCamera(entity.camera);
        }
  
        // Add entity to physics entity map
        props.game.physics.add(entity);
        entities.push(entity);
      });
    }

    // Return final entity list
    return entities;
  }

  function openContextMenu(e, entity) {
    if (entity.isSelected) {
      let actions = [];
      let actionEdit = { text: 'Edit', icon: 'settings', disabled: entitiesSelected.length != 1, callback: () => editEntity(e, entity) }
      let actionLink = { text: 'Link', icon: 'link', disabled: entitiesSelected.length <= 1, callback: () => linkEntity(e, entity) }
      let actionUnlink = { text: 'Unlink', icon: 'link_off', disabled: isLinked() == false, callback: () => unlinkEntity(e, entity) }
      let actionDelete = { text: 'Delete', icon: 'delete', callback: () => deleteEntity(e, entity) }
      
      // Add delete action
      actions.push(actionEdit, actionLink, actionUnlink, actionDelete);

      // Dispatch event to the global context menu
      contextMenuEvent.value = e;
      contextMenuActions.value = actions;
    }
    else {
      // Select item and re-open context menu
      selectEntity(e, entity);
      openContextMenu(e, entity);
    }
  }

  function isLinked() {
    for (let i = entitiesSelected.length - 1; i >= 0; i--) {
      if (entitiesSelected[i].getParentId()) return true;
    }
    return false;
  }

  function pause() {
    ticker.stop();
    props.game.graphics.setCamera(controlsOrbit.object);
    props.game.graphics.render();
    enableControlsOrbit(true);
  }

  function play() {
    ticker.start()
    props.game.graphics.setCamera(props.game.player.camera);
    enableControlsOrbit(false);
  }

  function updateDebugger() {
    // Refresh the debugger if game is paused
    if (ticker.isRunning() == false) {
      props.game.physics.debugger.update();
      props.game.graphics.render();
    }
  }

  function onControlsOrbitStart() {
    
  }

  function onControlsOrbitChange() {
    if (props.game.ticker.isRunning() == false) {
      props.game.graphics.render();
    }
  }

  function enableControlsOrbit(enabled = true) {
    controlsOrbit.enablePan = enabled;
    controlsOrbit.enableRotate = enabled;
    controlsOrbit.enableZoom = enabled;
  }

  // Initialize app after canvas has been mounted
  onMounted(async function() {
    props.game.physics.debugger.enable();
    entities.value = loadLevel('boxel-3d-sandbox');
    document.addEventListener('keydown', onKeyDown);
    controlsOrbit.addEventListener('start', onControlsOrbitStart);
    controlsOrbit.addEventListener('change', onControlsOrbitChange);
    controlsOrbit.object.rotation.set(0, 0, 0);
    controlsOrbit.target.copy(props.game.player.getPosition());
    props.game.player.camera.getWorldPosition(controlsOrbit.object.position);
  });

  onUnmounted(function() {
    document.removeEventListener('keydown', onKeyDown);
    controlsOrbit.removeEventListener('start', onControlsOrbitStart);
    controlsOrbit.removeEventListener('change', onControlsOrbitChange);
  });
</script>

<template>
  <div>
    <div class="panels">
      <PanelActions
        :game="game"
        :mode="mode"
        @setMode="setMode"
      />
      <PanelPrefabs
        :game="game"
        :mode="mode"
        @add-entity="addEntity"
      />
      <PanelScene
        :entities="entities"
        :canUndo="canUndo"
        :canRedo="canRedo"
        :isPlaying="isPlaying"
        @add-entity="addEntity"
        @delete-entity="deleteEntity"
        @link-entity="linkEntity"
        @move-entity="moveEntity"
        @pause="pause"
        @play="play"
        @rename-entity="renameEntity"
        @reset-entities="resetEntities"
        @select-entity="selectEntity"
        @select-parent-entity="selectParentEntity"
        @setMode="setMode"
        @unlink-entity="unlinkEntity"
        @open-context-menu="openContextMenu"
        @redo="redo"
        @undo="undo"
      />
    </div>
    <ContextMenu :event="contextMenuEvent" :actions="contextMenuActions" />
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