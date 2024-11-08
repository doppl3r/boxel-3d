<script setup>
  // Initialize app and expose to window scope
  const props = defineProps({
    data: Object
  });

  function onDragStart(e, entity) {
    if (props.data.children) {
      var index = props.data.children.indexOf(entity);
      e.dataTransfer.setData('text/plain', index);
    }
  }

  function onDragEnd(e, entity) {
    //console.log(e);
  }

  function onDragOver(e, entity) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  
  function onDrop(e, endEntity) {
    e.preventDefault();
    if (props.data.children) {
      const startIndex = e.dataTransfer.getData('text/plain');
      const startEntity = props.data.children[startIndex];
      const endIndex = props.data.children.indexOf(endEntity);
      
      if (startIndex != endIndex) {
        props.data.children.splice(startIndex, 1);
        props.data.children.splice(endIndex, 0, startEntity);
      }
    }
  }
</script>

<template>
  <div class="item">
    <div class="tab" v-if="props.data.type" draggable="true"
      @dragstart="onDragStart($event, props.data)"
      @dragend="onDragEnd($event, props.data)"
      @dragover="onDragOver($event, props.data)"
      @drop="onDrop($event, props.data)">
      {{ props.data.type }}
    </div>

    <PanelSceneItem v-for="entity in props.data.children" :data="entity" />
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