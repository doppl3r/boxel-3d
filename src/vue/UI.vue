<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import Origin from './Origin.vue'; // v1.0 theme
  import Bubble from './Bubble.vue'; // v2.0 theme

  // Set initial values
  var theme = ref('bubble');
  var options = ['origin', 'bubble'];

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
    // Check if local settings exists
    if (settings && settings.theme) {
      // Check if settings theme is an option
      if (options.includes(settings.theme)) {
        theme.value = settings.theme;
      }
    }
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