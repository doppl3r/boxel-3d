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

    &.left {
      margin-right: auto;
    }

    &.right {
      margin-left: auto;
    }

    &.notification {
      &:after {
        animation: throb 1s ease-in-out infinite;
        background-color: #EB2B6D;
        border-radius: 99em;
        content: '';
        display: block;
        height: 0.75em;
        right: -0.125em;
        position: absolute;
        top: -0.125em;
        width: 0.75em;
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

    @keyframes throb { 0% { transform: scale(1); } 50% { transform: scale(1.20); } 100% { transform: scale(1); }}
  }
</style>