<script setup>
  import '../scss/Bubble.scss';
  import { nextTick, onMounted, onUnmounted, ref } from 'vue';
  import BubblePageHome from './BubblePageHome.vue';
  import BubblePageSkins from './BubblePageSkins.vue';
  import BubblePageLevelPicker from './BubblePageLevelPicker.vue';
  import BubblePageCampaign from './BubblePageCampaign.vue';
  import BubbleMultiplayer from './BubbleMultiplayer.vue';
  import BubbleSettings from './BubbleSettings.vue';
  import BubblePopup from './BubblePopup.vue';

  // Conditionally render components
  var page = ref('home');

  function addEventListeners() {
    window.addEventListener('setPage', setPageFromEvent);
  }

  function removeEventListeners() {
    window.removeEventListener('setPage', setPageFromEvent);
  }

  function setPageFromEvent(e) {
    if (e.detail) setPage(e.detail);
  }

  function setPage(name) {
    page.value = name;
    app.state = name;

    // Redirect to home page
    if (name == 'level-picker') {
      page.value = 'home';

      // Open popup after first render
      nextTick(() => {
        window.dispatchEvent(new CustomEvent('openLevelSelectorPopup'));
      })
    }
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
    <BubblePageSkins v-if="page == 'skins'" @set-page="setPage" />
    <BubblePageLevelPicker v-if="page == 'level-picker'" @set-page="setPage" />
    <BubblePageCampaign v-if="page == 'campaign'" @set-page="setPage" />
    <BubbleMultiplayer />
    <BubbleSettings />
    <BubblePopup />
  </div>
</template>