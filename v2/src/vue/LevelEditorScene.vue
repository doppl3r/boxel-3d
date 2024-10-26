<script setup>
  import { onMounted } from 'vue';

  // Initialize app and expose to window scope
  const props = defineProps({
    entities: Object
  });
  
  // Initialize app after canvas has been mounted
  onMounted(function() {
    
  });
</script>

<template>
  <div class="scene">
    <div class="header">
      <div class="title">Scene</div>
      <div class="actions">

      </div>
    </div>
    <div class="entities">
      <div class="entity" v-for="[key, value] in props.entities" :key="key">
        <div class="icon" :class="value.type"></div>
        {{ value.type }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .scene {
    border-radius: 0.5em;
    background-color: #FFCB4C;
    border: 0.25em solid #000000;
    box-shadow: 0 0.25em 0 #000000;
    padding: 0.5em;
    position: absolute;
    right: 1.5em;
    top: 1.5em;
    width: 10em;

    ::-webkit-scrollbar { width: 0.25em; }
    ::-webkit-scrollbar-track { background: rgba(#FFA217, 1); border-radius: 99em; }
    ::-webkit-scrollbar-thumb { background: rgba(#000000, 1); border-radius: 99em; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(#F52D59, 1); border-radius: 99em; }

    .entities {
      display: flex;
      flex-direction: column;
      gap: 0.125em;
      overflow-y: auto;
      padding-right: 0.5em;
      height: 12em;

      .entity {
        align-items: center;
        background-color: #FFA217;
        border-radius: 0.25em;
        display: flex;
        font-size: 1em;
        line-height: 1.5em;
        padding: 0 0.25em;
      }
    }
  }
</style>