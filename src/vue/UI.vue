<script setup>
  import { ref } from 'vue';
  import Origin from './Origin.vue'; // v1.0 theme
  import Bubble from './Bubble.vue'; // v2.0 theme

  // TODO: Get active theme from settings
  var theme = ref('bubble');
</script>

<template>
  <Origin v-if="theme == 'origin'" />
  <Bubble v-if="theme == 'bubble'" />
</template>