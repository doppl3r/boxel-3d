<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import Origin from './Origin.vue'; // v1.0 theme
  import Bubble from './Bubble.vue'; // v2.0 theme

  // Set initial values
  var theme = ref('bubble');

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('updateTheme', updateTheme);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('updateTheme', updateTheme);
  }

  function updateTheme(e) {
    var settings = JSON.parse(localStorage.getItem('settings'));
    if (settings && settings.theme) theme.value = settings.theme;
  }

  onMounted(function() {
    updateTheme(); // Run by default
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <Origin v-if="theme == 'origin'" />
  <Bubble v-if="theme == 'bubble'" />
</template>