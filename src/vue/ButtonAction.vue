<template>
  <button class="action" title="Fullscreen">
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
  .action {
    align-items: center;
    background-color: #FFCB4C;
    border: 0.25em solid #000000;
    border-radius: 0.5em;
    box-shadow: 0 0.25em 0 #000000;
    color: #000000;
    cursor: pointer;
    display: flex;
    height: 2em;
    justify-content: center;
    outline: none;
    transition: transform 0.1s ease-out;
    width: 2em;

    &:hover,
    &:focus {
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.9);
    }
  }
</style>