<script setup>
  // Define item emits and props
  const emit = defineEmits(['itemContextMenu', 'itemDragDrop', 'itemDragStart'])
  const props = defineProps({
    data: Object
  });
</script>

<template>
  <div class="item">
    <div class="tab" v-if="props.data.type" draggable="true"
      @contextmenu="emit('itemContextMenu', $event, props.data)"
      @dragstart="emit('itemDragStart', $event, props.data)"
      @drop="emit('itemDragDrop', $event, props.data)">
      {{ props.data.type }}
    </div>

    <PanelSceneItem v-for="item in props.data.children"
      :data="item"
      @item-context-menu="emit('itemContextMenu', $event, item)"
      @item-drag-start="emit('itemDragStart', $event, item)"
      @item-drag-drop="emit('itemDragDrop', $event, item)"
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