<script setup>
  import { ref } from 'vue';

  // Initialize app and expose to window scope
  const props = defineProps({
    canUndo: Boolean,
    canRedo: Boolean,
    entities: Array,
    isPlaying: Boolean
  });
  const emit = defineEmits([
    'addEntity',
    'deleteEntity',
    'linkEntity',
    'moveEntity',
    'openContextMenu',
    'pause',
    'play',
    'renameEntity',
    'resetEntities',
    'selectEntity',
    'selectParentEntity',
    'unlinkEntity',
    'redo',
    'undo'
  ]);
  const expanded = ref(true);
  const content = ref();

  function isExpanded() {
    return expanded.value == true;
  }

  function onClick(e, entity) {
    emit('selectEntity', e, entity);
  }

  function onContextMenu(e, entity) {
    emit('openContextMenu', e, entity);
  }

  function focusInput(e) {
    e.target.parentNode.removeAttribute('draggable');
    e.target.removeAttribute('readonly');
  }

  function unfocusInput(e) {
    e.target.parentNode.setAttribute('draggable', true);
    e.target.setAttribute('readonly', true);
    e.target.blur();
  }

  function onDragStart(e, entity) {
    if (entity.isSelected != true) {
      onClick(e, entity);
    }
  }

  function onDragOver(e, entity) {
    
  }

  function onDragEnd(e, entity) {
    content.value.style.overflowY = 'auto';
  }
  
  function onDragDrop(e, entity) {
    emit('moveEntity', e, entity);
  }
</script>

<template>
  <div class="panel">
    <div class="header">
      <div class="title" @click="expanded = !expanded">Scene</div>
      <div class="actions">
        <button class="action button" @click="emit('undo')" title="Undo" :disabled="props.canUndo == false">
          <span class="material-symbols-rounded">undo</span>
        </button>
        <button class="action button" @click="emit('redo')" title="Redo" :disabled="props.canRedo == false">
          <span class="material-symbols-rounded">redo</span>
        </button>
        <button class="action button" @click="emit('resetEntities')" title="Restart level">
          <span class="material-symbols-rounded">fast_rewind</span>
        </button>
        <button v-if="isPlaying == true" @click="emit('pause')" class="action button" title="Pause level">
          <span class="material-symbols-rounded">pause</span>
        </button>
        <button v-else class="action button" @click="emit('play')" title="Play level">
          <span class="material-symbols-rounded">play_arrow</span>
        </button>
      </div>
    </div>
    <div ref="content" class="content" v-show="isExpanded()">
      <ul>
        <TransitionGroup name="list">
          <li v-for="entity in props.entities"
            :key="entity.id"
            :class="{ selected: entity.isSelected }"
            draggable="true"
            @click="onClick($event, entity)"
            @contextmenu.prevent="onContextMenu($event, entity)"
            @dragstart="onDragStart($event, entity)"
            @dragover.prevent="onDragOver($event, entity)"
            @dragend="onDragEnd($event, entity)"
            @drop="onDragDrop($event, entity)"
          >
            <span
              @dblclick="emit('selectParentEntity', $event, entity)"
              :class="{ hidden: entity.rigidBodyDesc.userData.parentId == null }"
              class="icon material-symbols-rounded"
              title="Double click to select parent"
            >
              link
            </span>
            <input
              type="text"
              readonly
              :id="entity.id"
              :value="entity.name || entity.type"
              @change="emit('renameEntity', $event, entity)"
              @keyup.enter="unfocusInput"
              @focusout="unfocusInput"
              @dblclick="focusInput"
            />
          </li>
        </TransitionGroup>
        <li v-if="props.entities.length == 0" @click="emit('addEntity', $event);">
          <span class="material-symbols-rounded">add</span>
          Add entity
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
  
</style>

<style lang="scss" scoped>
  ::-webkit-scrollbar { width: 0.25em; }
  ::-webkit-scrollbar-track { background: rgba(#FFA217, 1); border-radius: 99em; }
  ::-webkit-scrollbar-thumb { background: rgba(#000000, 1); border-radius: 99em; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(#F52D59, 1); border-radius: 99em; }

  .panel {
    border-radius: 0.5em;
    background-color: #FFCB4C;
    border: 0.25em solid #000000;
    box-shadow: 0 0.25em 0 #000000;
    display: flex;
    flex-direction: column;
    max-height: calc(100% - 2em);
    padding: 0.5em;
    position: absolute;
    right: 1em;
    top: 1em;
    width: 10em;

    .header {
      align-items: center;
      display: flex;
      
      .title {
        cursor: pointer;
        flex-grow: 1;
      }

      .actions {
        align-items: center;
        display: flex;
        gap: 0.125em;

        .action {
          align-items: center;
          background-color: transparent;
          border-radius: 0.25em;
          border-width: 0;
          cursor: pointer;
          display: flex;
          height: 1em;
          justify-content: center;
          width: 1em;

          &:hover {
            background-color: #F52D59;
          }

          &[disabled] {
            pointer-events: none;
            user-select: none;
          }

          .material-symbols-rounded {
            font-size: 1em;
          }
        }
      }
    }

    .content {
      flex-grow: 1;
      margin-top: 0.25em;
      min-height: 8em;
      overflow-x: hidden;
      overflow-y: auto;
      padding-right: 0.5em;
      scroll-behavior: smooth;
      
      ul {
        display: flex;
        flex-direction: column;
        gap: 0.125em;
        list-style-type: none;
        margin: 0;
        padding: 0;

        li {
          align-items: center;
          background-color: #FFA217;
          border-radius: 0.25em;
          cursor: pointer;
          display: flex;
          opacity: 1;
          padding: 0 0.25em;
          transition-duration: 0.1s;
          transition-property: font-size, opacity, transform;
          transition-timing-function: ease-in-out;
          width: 100%;
          
          &.selected {
            background-color: rgba(#F52D59, 1);
          }
          
          &.list-leave-active {
            opacity: 0;
            font-size: 0;

            .icon {
              font-size: 0;
            }
          }

          .icon {
            padding-right: 0.125em;
            transition: inherit;

            &.hidden {
              font-size: 0;
            }
          }
          
          input {
            background-color: transparent;
            border-width: 0;
            color: inherit;
            font-family: inherit;
            font-size: 1em;
            line-height: 1.5em;
            outline: none;
            padding: 0;
            text-shadow: inherit;
            width: 100%;

            &[readonly] {
              cursor: pointer;
            }
          }
        }
      }
    }
  }
</style>