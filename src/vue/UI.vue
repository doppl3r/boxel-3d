<script setup>
  import { onMounted, onUnmounted, ref } from 'vue';
  import Origin from './Origin.vue'; // v1.0 theme
  import Bubble from './Bubble.vue'; // v2.0 theme

  // Set initial values
  var theme = ref('bubble');
  var options = ['origin', 'bubble'];

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('setTheme', setThemeFromEvent);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('setTheme', setThemeFromEvent);
  }

  function setThemeFromEvent(e) {
    if (e && e.detail) {
      // Set theme from event details
      setTheme(e.detail);
    }
    else {
      // Set theme from local settings
      var settings = JSON.parse(localStorage.getItem('settings'));
      // Check if local settings exists
      if (settings && settings.theme != null) {
        // Check if settings theme is an option
        if (options.includes(settings.theme)) {
          setTheme(settings.theme);
        }
        else {
          // Save settings: Fixes original "0" or "1" values
          settings.theme = theme.value;
          localStorage.setItem('settings', JSON.stringify(settings));
        }
      }
    }
  }

  function setTheme(name) {
    theme.value = name;
  }

  onMounted(function() {
    setThemeFromEvent(); // Set theme from storage
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