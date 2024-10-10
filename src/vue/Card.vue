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
    border-radius: calc($border-width * 4);
    padding: $border-width;
    position: relative;
    transition: transform 0.15s ease-out;

    &:hover {
      transform: scale(1.1);
    }

    img {
      border-radius: calc(($border-width * 2) + $border-width);
      display: block;
      height: 6.25em; // 100px
      margin-bottom: $border-width;
      object-fit: cover;
      width: 6.25em;
    }

    label {
      background-color: #000000;
      border-radius: 99em;
      bottom: calc(($border-width * -2));
      color: #ffffff;
      left: 50%;
      padding: 0 0.75em $border-width;
      position: absolute;
      transform: translate(-50%, 0%);
      white-space: nowrap;
    }
  }
</style>