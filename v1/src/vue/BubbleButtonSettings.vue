<script setup>
  import { useI18n } from 'vue-i18n';

  const i18n = useI18n({ useScope: 'global' });

  function openSettings() {
    // Dispatch new popup from event
    window.dispatchEvent(new CustomEvent('openSettings'));
  }
</script>

<template>
  <a @click="openSettings" :title="i18n.t('popup.button.settings')">
    <span class="material-symbols-rounded">settings</span>
  </a>
</template>