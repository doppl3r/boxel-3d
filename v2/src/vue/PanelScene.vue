<script setup>
  import { onMounted, ref } from 'vue';
  import PanelSceneItem from './PanelSceneItem.vue';

  // Initialize app and expose to window scope
  const props = defineProps({ game: Object });
  const expanded = ref(true);
  const content = ref();
  const scene = ref([]);

  async function loadFile(path) {
    // Fetch public folder for level
    return fetch(path).then(function (response) {
      if (response.ok) { return response.json(); }
      throw new Error('Something went wrong');
    })
    .then(function(json) { return json; }.bind(this))
    .catch(function(error) { console.error(error); });
  }

  function isExpanded() {
    return expanded.value == true
  }

  function onDragOver(e) {
    const speed = 1;
    /* if (e.clientY < 100) {
      setTimeout(function() {
        console.log(e, content.value);
        content.value.scrollBy(0, -speed);
      }, 500);
    } */
  }

  function itemContextMenu(e, item) {
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

  function itemDragStart(item) {
    //console.log(item);
  }
  
  function itemDragDrop(item) {
    //console.log(item);
  }

  onMounted(async () => {
    const level = await loadFile('../json/boxel-3d-sandbox.json');
    scene.value = level;
  })
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
    <div ref="content" class="content" v-show="expanded == true" @dragover.stop.prevent="onDragOver">
      <PanelSceneItem
        :item="scene"
        v-show="isExpanded"
        @item-context-menu="itemContextMenu"
        @item-drag-start="itemDragStart"
        @item-drag-drop="itemDragDrop"
      />
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
      height: 8em;
      margin-top: 0.25em;
      overflow-y: auto;
      padding-right: 0.5em;
    }
  }
</style>