<script setup>
  // Initialize props
  var props = defineProps(['src']);
</script>

<template>
  <button class="card">
    <img :src="src" />
    <label>
      <slot></slot>
    </label>
  </button>
</template>

<style lang="scss" scoped>
  @keyframes pulse { 0% { transform: scale(1); } 25% { transform: scale(1.20); } 50% { transform: scale(1); } }

  .card {
    background-color: #000000;
    border: 0 solid #000000;
    border-radius: calc(0.25em * 4);
    box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
    cursor: pointer;
    font-family: inherit;
    outline: none;
    padding: 0;
    position: relative;
    transition: transform 0.1s ease-out;

    &:hover,
    &:focus {
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.9);
    }

    &.pulse {
      animation: pulse 2s ease-in-out infinite;

      &:hover {
        transform: scale(1);
      }
    }

    img {
      border-radius: 0.75em;
      display: block;
      height: 6.25em; // 100px
      object-fit: cover;
      pointer-events: none;
      width: 6.25em;
    }

    label {
      background-color: #000000;
      border-radius: 99em;
      bottom: -0.75em;
      box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
      color: #ffffff;
      left: 50%;
      line-height: 1em;
      padding: 0.125em 0.75em 0.25em;
      position: absolute;
      transform: translate(-50%, 0%);
      white-space: nowrap;
    }
  }
</style>