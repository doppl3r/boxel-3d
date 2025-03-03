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
        background-color: #0287ef;
        border-radius: 99em;
        content: '';
        display: block;
        height: 0.5em;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(50%, -150%);
        width: 0.5em;
      }
    }
  }
</style>