<script setup>
  import { ref } from 'vue';
  import ButtonAction from './ButtonAction.vue';

  const clicked = ref(false);
</script>

<template>
  <ButtonAction :class="{ 'notification': clicked == false }" @click="clicked = true;" title="News">
    <span class="material-symbols-rounded">campaign</span>
  </ButtonAction>
</template>

<style lang="scss" scoped>
  .action {
    :deep(img) {
      filter: invert(1);
      width: 1.5em;
      height: 1.5em;
    }
  }
</style>