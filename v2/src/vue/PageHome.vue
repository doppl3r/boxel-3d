<script setup>
  import { onMounted, ref } from 'vue';

  // Initialize app and expose to window scope
  var title = ref('Home Page');

  // Initialize app after canvas has been mounted
  onMounted(function() {
    
  });
</script>

<template>
  <h1>{{ title }}</h1>
</template>

<style lang="scss" scoped>

</style>