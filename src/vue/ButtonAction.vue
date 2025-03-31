<script setup>
  const props = defineProps({
    color: String
  });
</script>

<template>
  <button class="action" :style="{ 'background-color': props.color }">
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
    font-family: inherit;
    gap: 0.5em;
    height: 2em;
    justify-content: center;
    outline: none;
    position: relative;
    transition: transform 0.1s ease-out;
    width: 2em;

    &.notification {
      &:after {
        background-color: #ff0000;
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

    &:hover,
    &:focus {
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.9);
    }

    :deep(img) {
      filter: drop-shadow(0 0.125em 0 rgba(#000000, 0.25));
      width: 1.5em;
      height: 1.5em;
    }
  }
</style>