<script setup>
  import { ref } from 'vue';
  import ButtonAction from './ButtonAction.vue';

  const settings = ref(JSON.parse(localStorage.getItem('settings') || '{}'));
  const volume = ref(settings.value.volume || 0);

  function toggleVolume() {
    volume.value = volume.value == 0 ? 1 : 0;
    settings.value.volume = volume.value;
    localStorage.setItem('settings', JSON.stringify(settings.value));
  }
</script>

<template>
  <ButtonAction class="action" @click="toggleVolume()">
    <span class="material-symbols-rounded" v-if="volume != 0">volume_up</span>
    <span class="material-symbols-rounded" v-else>volume_off</span>
  </ButtonAction>
</template>