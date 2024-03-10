<script setup>
  import '../scss/Origin.scss';
  import { ref } from 'vue';
  import OriginHome from './OriginHome.vue';
  import OriginLevelPicker from './OriginLevelPicker.vue';
  import OriginCampaign from './OriginCampaign.vue';
  import OriginLevelManager from './OriginLevelManager.vue';
  import OriginSkins from './OriginSkins.vue';
  import OriginLevelEditor from './OriginLevelEditor.vue';

  // TODO: Conditionally render components
</script>

<template>
  <div class="ui-origin">
    <OriginHome />
    <OriginLevelPicker />
    <OriginCampaign />
    <OriginLevelManager />
    <OriginSkins />
    <OriginLevelEditor />
  </div>
</template>