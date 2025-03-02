<script setup>
  import ButtonAction from './ButtonAction.vue';

  const props = defineProps({
    assets: Object,
    volume: Number
  });
</script>

<template>
  <ButtonAction class="action" title="Volume">
    <span class="material-symbols-rounded" v-if="volume != 0">volume_up</span>
    <span class="material-symbols-rounded" v-else>volume_off</span>
  </ButtonAction>
</template>