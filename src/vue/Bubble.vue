<script setup>
  import '../scss/Bubble.scss';
  import { onMounted, onUnmounted, ref } from 'vue';
  import BubblePageHome from './BubblePageHome.vue';
  import BubblePageSkins from './BubblePageSkins.vue';
  import BubblePageLevelPicker from './BubblePageLevelPicker.vue';
  import BubblePageCampaign from './BubblePageCampaign.vue';
  import BubbleMultiplayer from './BubbleMultiplayer.vue';
  import BubbleSettings from './BubbleSettings.vue';
  import BubblePopup from './BubblePopup.vue';

  // Conditionally render components
  var page = ref('home');
  var fontSize = ref();

  function addEventListeners() {
    window.addEventListener('setPage', setPageFromEvent);
    window.addEventListener('updateScale', updateScale);
  }

  function removeEventListeners() {
    window.removeEventListener('setPage', setPageFromEvent);
    window.removeEventListener('updateScale', updateScale);
  }

  function setPageFromEvent(e) {
    if (e.detail) setPage(e.detail);
  }

  function setPage(name) {
    page.value = name;
    app.state = name;
  }

  function updateScale(e) {
    fontSize.value = null;
    if (e.detail < 1 || e.detail > 1) {
      fontSize.value = (e.detail * 4) + 'vh';
    }
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    addEventListeners();
    // Apply current settings scale on mount so remount preserves user choice
    try {
      var settings = app.storage.getSettings();
      updateScale({ detail: settings.scale });
    }
    catch (err) {
      console.error(err);
    }
  });

  onUnmounted(function() {
    removeEventListeners();
  })
</script>

<template>
  <div class="ui-bubble" :style="{ fontSize }">
    <BubblePageHome v-if="page == 'home'" @set-page="setPage" />
    <BubblePageSkins v-if="page == 'skins'" @set-page="setPage" />
    <BubblePageLevelPicker v-if="page == 'level-picker'" @set-page="setPage" />
    <BubblePageCampaign v-if="page == 'campaign'" @set-page="setPage" />
    <BubbleMultiplayer />
    <BubbleSettings />
    <BubblePopup />
  </div>
</template>