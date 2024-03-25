<script setup>
  import '../scss/Bubble.scss';
  import { ref, onMounted, onUnmounted } from 'vue';
  import BubblePageHome from './OriginPageHome.vue';

  // Conditionally render components
  var page = ref('home');

  function addEventListeners() {
    window.addEventListener('setPage', setPageFromEvent);
  }

  function removeEventListeners() {
    window.removeEventListener('setPage', setPageFromEvent);
  }

  function setPageFromEvent(e) {
    if (e.detail.page) setPage(e.detail.page);
  }

  function setPage(name) {
    page.value = name;
    app.state = name;
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  })
</script>

<template>
  <div class="ui-bubble">
    <BubblePageHome v-if="page == 'home'" @set-page="setPage" />
  </div>
</template>