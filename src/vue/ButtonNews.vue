<script setup>
  import { ref } from 'vue';
  import ButtonAction from './ButtonAction.vue';

  const clicked = ref(false);
</script>

<template>
  <ButtonAction :class="{ 'notification': clicked == false }" @click="clicked = true;" title="News">
    <span class="material-symbols-rounded">notifications</span>
  </ButtonAction>
</template>

<style lang="scss" scoped>
  .action {
    :deep(img) {
      filter: invert(1);
      width: 1.5em;
      height: 1.5em;
    }

    &.notification {
      &:after {
        background-color: #ff0000;
        border-radius: 99em;
        box-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
        box-sizing: border-box;
        content: '';
        display: block;
        height: 0.75em;
        position: absolute;
        right: 0;
        top: 0;
        transform: translate(50%, -50%);
        width: 0.75em;
      }
    }
  }
</style>