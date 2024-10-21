<script setup>
  import { computed, onMounted, ref, watch } from 'vue';

  // Initialize app and expose to window scope
  const props = defineProps({
    game: Object
  });

  // Assign entities to game entities
  const entities = ref(props.game.stage.physics.entities);
  const entitiesArr = computed(() => {
    var arr = Array.from(entities.value).map(([name, value]) => (value));
    return arr;
  });

  setTimeout(function() {
    var entity = entities.value.entries().next().value[1];
    props.game.stage.physics.remove(entity)
  }, 1000);

  watch(props.game, (after, before) => {
    /* console.log(before, after); */
  }, { deep: true })
  
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
      <div class="entity" v-for="(entity, key) of entitiesArr" :key="key">
        <div class="icon" :class="entity.type"></div>
        {{ entity.type }}
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