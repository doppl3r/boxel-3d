<script setup>
  import '../scss/Origin.scss';
  import { ref } from 'vue';
  import OriginPageHome from './OriginPageHome.vue';
  import OriginPageLevelPicker from './OriginPageLevelPicker.vue';
  import OriginPageCampaign from './OriginPageCampaign.vue';
  import OriginPageLevelManager from './OriginPageLevelManager.vue';
  import OriginPageSkins from './OriginPageSkins.vue';
  import OriginPageLevelEditor from './OriginPageLevelEditor.vue';
  import OriginPopup from './OriginPopup.vue';

  // TODO: Conditionally render components
  var page = ref('home');
</script>

<template>
  <div class="ui-origin">
    <OriginPageHome v-if="page == 'home'" />
    <OriginPageLevelPicker />
    <OriginPageCampaign />
    <OriginPageLevelManager />
    <OriginPageSkins />
    <OriginPageLevelEditor />
    <OriginPopup />
  </div>
</template>