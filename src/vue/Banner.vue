<script setup>
  import { ref } from 'vue';

  // Initialize props
  
</script>

<template>
  <div class="banner">
    <span class="text">
      <slot></slot>
    </span>
  </div>
</template>

<style lang="scss" scoped>
  $border-width: 0.25em;

  .banner {
    background-color: #FFCB4C;
    background-image: url('/svg/background-stars.svg');
    background-size: 8em;
    background-position: center;
    border-top: 0.25em solid #000000;
    border-bottom: 0.5em solid #000000;
    display: flex;
    justify-content: center;
    padding: 0.5em;
    position: relative;
    transition: transform 0.1s ease-out;
    width: 100%;

    span {
      background-color: #000000;
      border-radius: 99em;
      color: #ffffff;
      display: block;
      font-size: 2em;
      line-height: 1em;
      padding: 0.125em 1em;
    }
  }
</style>