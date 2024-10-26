<script setup>
  import { ref } from 'vue';

  // Initialize props
  var props = defineProps(['src', 'text']);
</script>

<template>
  <div class="card">
    <img :src="src" />
    <label>{{ text }}</label>
  </div>
</template>

<style lang="scss" scoped>
  $border-width: 0.25em;

  .card {
    background-color: #000000;
    border: 0.25em solid #000000;
    border-radius: calc($border-width * 4);
    box-shadow: 0 $border-width 0 #000000;
    position: relative;
    transition: transform 0.1s ease-out;

    &:hover {
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.9);
    }

    img {
      border-radius: calc(($border-width * 2) + $border-width);
      display: block;
      height: 6.25em; // 100px
      object-fit: cover;
      pointer-events: none;
      width: 6.25em;
    }

    label {
      background-color: #000000;
      border-radius: 99em;
      bottom: calc(($border-width * -4));
      color: #ffffff;
      left: 50%;
      line-height: 1em;
      padding: 0.125em 0.75em $border-width;
      position: absolute;
      transform: translate(-50%, 0%);
      white-space: nowrap;
    }
  }
</style>