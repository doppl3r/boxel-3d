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
    <div class="title">Scene</div>
    <div class="actions">

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
    background-color: #ffffff;
    padding: 1em;
    position: absolute;
    right: 1em;
    top: 1em;
  }
</style>