<script setup>
  import { onMounted, ref } from 'vue';

  // Initialize app and expose to window scope
  const props = defineProps({ game: Object, entities: Array });
  const emit = defineEmits(['addEntity', 'moveEntity']);
  const expanded = ref(true);
  const content = ref();

  let entity1 = {};
  let scrolling = false;

  function isExpanded() {
    return expanded.value == true;
  }

  function onContextMenu(e, entity) {
    document.dispatchEvent(new CustomEvent('contextmenu', {
      detail: [
        {
          text: 'Delete',
          icon: 'delete',
          callback: () => console.log('deleted')
        }
      ]
    }));
  }

  function onDragStart(e, entity) {
    entity1 = entity;
  }

  function onDragEnd(e, entity) {
    content.value.style.overflowY = 'auto';
  }
  
  function onDragDrop(e, entity2) {
    emit('moveEntity', e, entity1, entity2);
    entity1 = null;
  }

  function onContentDragOver(e) {
    const contentOffset = content.value.getBoundingClientRect();
    const scrollUp = e.clientY - contentOffset.top < e.target.offsetHeight;
    const scrollDown = e.clientY - contentOffset.top > content.value.offsetHeight - e.target.offsetHeight;
    const direction = (scrollUp ? -1 : 0) + (scrollDown ? 1 : 0);

    if (scrollDown || scrollUp) {
      content.value.style.overflowY = 'hidden';
      if (scrolling == false) {
        scrolling = true;
        setTimeout(() => {
          content.value.scrollBy(0, e.target.offsetHeight * direction);
          scrolling = false;
        }, 50);
      }
    }
  }
</script>

<template>
  <div class="panel">
    <div class="header">
      <div class="title" @click="expanded = !expanded">Scene</div>
      <div class="actions">
        <div class="action button" title="Play level">
          <span class="material-symbols-rounded">play_arrow</span>
        </div>
        <div class="action button" title="Settings">
          <span class="material-symbols-rounded">settings</span>
        </div>
      </div>
    </div>
    <div ref="content" class="content" v-show="isExpanded()" @dragover.stop.prevent="onContentDragOver">
      <ul>
        <li v-for="(entity, index) in props.entities" :key="index"
          draggable="true"
          @contextmenu="onContextMenu($event, entity)"
          @dragstart="onDragStart($event, entity)"
          @dragend="onDragEnd($event, entity)"
          @drop="onDragDrop($event, entity)">
          <label>
            {{ entity.type }}
          </label>
        </li>
        <li v-if="props.entities.length == 0" @click="emit('addEntity', $event);">
          <span class="material-symbols-rounded">add</span>
          Add entity
        </li>
      </ul>
    </div>
  </div>
</template>

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
          border-radius: 0.25em;
          cursor: pointer;
          display: flex;
          height: 1em;
          justify-content: center;
          width: 1em;

          &:hover {
            background-color: #F52D59;
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
        list-style-type: none;
        margin: 0;
        padding: 0;
        position: relative;

        li {
          padding-bottom: 0.125em;
          width: 100%;

          &:last-of-type {
            padding-bottom: 0;
          }
          
          label {
            align-items: flex-start;
            background-color: #FFA217;
            border-radius: 0.25em;
            cursor: pointer;
            display: flex;
            font-size: 1em;
            line-height: 1.5em;
            padding: 0 0.25em;
            width: 100%;

            &.selected {
              background-color: #F52D59;
              color: #ffffff;
            }
          }
        }
      }
    }
  }
</style>