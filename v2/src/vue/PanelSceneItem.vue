<script setup>
  // Define item emits and props
  const props = defineProps({ item: Object });
  const emit = defineEmits(['itemContextMenu', 'itemDragDrop', 'itemDragStart']);
</script>

<template>
  <div class="item">
    <div class="tab" draggable="true" v-if="props.item.type"
      @contextmenu="emit('itemContextMenu', props.item)"
      @dragstart="emit('itemDragStart', props.item)"
      @drop="emit('itemDragDrop', props.item)">
      {{ props.item.type }}
    </div>

    <PanelSceneItem v-for="item in props.item.children"
      :item="item"
      @item-context-menu="emit('itemContextMenu', item)"
      @item-drag-start="emit('itemDragStart', item)"
      @item-drag-drop="emit('itemDragDrop', item);"
    />
  </div>
</template>

<style lang="scss" scoped>
  .item {
    align-items: flex-start;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    font-size: 1em;
    gap: 0.125em;
    line-height: 1.5em;
    width: 100%;    
    
    .tab {
      background-color: #FFA217;
      border-radius: 0.25em;
      padding: 0 0.25em;
      width: 100%;

      &:hover {
        background-color: #F52D59;
      }

      &.selected {
        background-color: #000000;
        color: #ffffff;
      }
    }

    * > .item {
      padding-left: 0.5em;
    }
  }
</style>