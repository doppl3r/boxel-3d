<script setup>
  const props = defineProps({
    color: String
  });
</script>

<template>
  <button class="action" title="Fullscreen" :style="{ 'background-color': props.color }">
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
  .action {
    align-items: center;
    background-color: #FFCB4C;
    border: 0 solid #000000;
    border-radius: 0.5em;
    box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
    color: #000000;
    cursor: pointer;
    display: flex;
    height: 2em;
    justify-content: center;
    outline: none;
    transition: transform 0.1s ease-out;
    width: 2em;

    :deep(img) {
      filter: drop-shadow(0 0.125em 0 rgba(#000000, 0.25));
      width: 1.5em;
      height: 1.5em;
    }

    &:hover,
    &:focus {
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.9);
    }
  }
</style>