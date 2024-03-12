<script setup>
  import { ref, onMounted } from 'vue';
  import OriginButtonSettings from './OriginButtonSettings.vue';

  // Run function after being mounted (visible)
  onMounted(function() {
    app.ui.updateSelectors();
    app.ui.levelList.empty();
    app.ui.appendEditorLevels(window.app)
    app.ui.updateLevelOptions(); // Update top bar
    app.ui.objectOptions.addClass('hidden'); // Disable bar on default
  });
</script>

<template>
  <div class="level-manager">
    <div class="row top">
      <div class="col">
        <a class="item" action="add-level" title="Add level"><img src="/img/svg/add.svg"></a>
        <a class="item" action="download" title="Download level"><img src="/img/svg/download.svg"></a>
        <a class="item" @click="$emit('setPage', 'home')" title="Exit level manager (ESC)"><img src="/img/svg/home.svg"></a>
        <OriginButtonSettings class="item" />
      </div>
    </div>
    <div class="row left">
      <div class="col list"></div>
    </div>
  </div>
</template>