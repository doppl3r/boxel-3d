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
    'setMode',
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

  function toggleEntity(e, entity) {
    entity.isExpanded = !entity.isExpanded;
  }

  function getEntityEventValue(entity) {
    if (entity.collidersDesc[0]) {
      if (entity.collidersDesc[0].events[0]) {
        let str = JSON.stringify(entity.collidersDesc[0].events[0].value);
        return str;
      }
    }
  }

  function setEntityEventValue(entity, value) {
    console.log(value);
    if (entity.collidersDesc[0]) {
      if (entity.collidersDesc[0].events[0]) {
        let newValue;
        try {
          newValue = JSON.parse(value)
        }
        catch {
          newValue = value;
        }
        entity.collidersDesc[0].events[0].value = newValue;
      }
    }
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
          <li v-for="entity in props.entities" :key="entity.id">
            <div class="entity-title"
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
                class="link material-symbols-rounded"
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
              <span
                @click="toggleEntity($event, entity)"
                class="toggle material-symbols-rounded"
                :class="{ isExpanded: entity.isExpanded }"
              >
                keyboard_arrow_down
              </span>
            </div>
            <div class="entity-properties" v-if="entity.isExpanded" :class="{ expanded: entity.isExpanded }">
              <div class="row">
                <span class="material-symbols-rounded">location_on</span>
                <input type="text" v-model="entity.rigidBodyDesc.translation.x" />
                <input type="text" v-model="entity.rigidBodyDesc.translation.y" />
                <input type="text" v-model="entity.rigidBodyDesc.translation.z" />
              </div>
              <div class="row">
                <span class="material-symbols-rounded">orbit</span>
                <input type="text" v-model="entity.rigidBodyDesc.rotation.x" />
                <input type="text" v-model="entity.rigidBodyDesc.rotation.y" />
                <input type="text" v-model="entity.rigidBodyDesc.rotation.z" />
              </div>
              <div class="row">
                <span class="material-symbols-rounded">package_2</span>
                <input type="text" v-model="entity.objectDesc.scale.x" />
                <input type="text" v-model="entity.objectDesc.scale.y" />
                <input type="text" v-model="entity.objectDesc.scale.z" />
              </div>
              <div class="row">
                <span class="material-symbols-rounded">bolt</span>
                <select>
                  <option>None</option>
                  <option v-for="name in Object.getOwnPropertyNames(entity).filter(n => typeof entity[n] == 'function')">{{ name }}</option>
                </select>
              </div>
              <div class="row">
                <span class="material-symbols-rounded">ink_pen</span>
                <input type="text" :value="getEntityEventValue(entity)" @change="setEntityEventValue(entity, $event.target.value)" placeholder="{x:0,y:0,z:0}"/>
              </div>
            </div>
          </li>
        </TransitionGroup>
        <li v-if="props.entities.length == 0" @click="emit('setMode', { type: 'add' });">
          <div class="entity-title">
            <span class="material-symbols-rounded">add</span>
            <span>Add entity</span>
          </div>
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
          cursor: pointer;
          opacity: 1;
          transition-duration: 0.1s;
          transition-property: font-size, opacity, transform;
          transition-timing-function: ease-in-out;
          width: 100%;
          
          &.list-leave-active {
            opacity: 0;
            font-size: 0;

            .entity-title {
              .link {
                font-size: 0;
              }
            }
          }

          .entity-title {
            align-items: center;
            background-color: #FFA217;
            border-radius: 0.25em;
            cursor: pointer;
            display: flex;
            padding: 0 0.25em;

            &.selected {
              background-color: rgba(#F52D59, 1);
            }

            .link {
              padding-right: 0.125em;
              transition: inherit;

              &.hidden {
                font-size: 0;
              }
            }

            .toggle {
              transition: transform 0.15s ease-in-out;

              &.isExpanded {
                transform: scaleY(-1);
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

          .entity-properties {
            display: flex;
            flex-direction: column;
            font-size: 0;
            gap: 0.125em;
            padding-top: 0.125em;
            transition: font-size 0.15s ease-in-out;

            &.expanded {
              font-size: 1em;
            }

            .row {
              align-items: center;
              display: flex;
              gap: 0.125em;

              .material-symbols-rounded {
                font-size: 1.5em;
              }

              input {
                background-color: #FFA217;
                border-width: 0;
                border-radius: 0.25em;
                color: inherit;
                font-family: inherit;
                font-size: 1em;
                line-height: 1.5em;
                min-width: 0;
                outline: none;
                padding: 0 0.25em;

                &::placeholder {
                  color: rgba(#000000, 0.25);
                }
              }

              select {
                background-color: #FFA217;
                border-radius: 0.25em;
                border-width: 0;
                color: inherit;
                font-family: inherit;
                font-size: inherit;
                line-height: 1.5em;
                min-width: 0;
                padding: 0 0.25em;
              }
            }
          }
        }
      }
    }
  }
</style>