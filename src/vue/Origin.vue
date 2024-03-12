<script setup>
  import '../scss/Origin.scss';
  import { ref, onMounted } from 'vue';
  import OriginPageHome from './OriginPageHome.vue';
  import OriginPageLevelPicker from './OriginPageLevelPicker.vue';
  import OriginPageCampaign from './OriginPageCampaign.vue';
  import OriginPageLevelManager from './OriginPageLevelManager.vue';
  import OriginPageSkins from './OriginPageSkins.vue';
  import OriginPageLevelEditor from './OriginPageLevelEditor.vue';
  import OriginPopup from './OriginPopup.vue';

  // TODO: Conditionally render components
  var page = ref('home');

  function setPage(name) {
    page.value = name;
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    
  });
</script>

<template>
  <div class="ui-origin">
    <OriginPageHome v-if="page == 'home'" @set-page="setPage" />
    <OriginPageLevelPicker v-if="page == 'level-picker'" @set-page="setPage" />
    <OriginPageCampaign v-if="page == 'campaign'" @set-page="setPage" />
    <OriginPageLevelManager v-if="page == 'level-manager'" @set-page="setPage" />
    <OriginPageSkins v-if="page == 'skins'" @set-page="setPage" />
    <OriginPageLevelEditor v-if="page == 'level-editor'" @set-page="setPage" />
    <OriginPopup />
  </div>
</template>