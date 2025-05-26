<script setup>
  import { useI18n } from 'vue-i18n';

  const i18n = useI18n({ useScope: 'global' });

  function checkpoint() {
    app.player.restart();
  }
</script>

<template>
  <a class="button fade-in" @click="checkpoint" :title="i18n.t('popup.button.checkpoint')">
    <span class="material-symbols-rounded">history</span>
  </a>
</template>

<style lang="scss" scoped>
  .button {
    background-color: #4CA9FF !important;
    box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
    height: 2em !important;
  }
</style>