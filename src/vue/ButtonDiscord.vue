<script setup>
  import ButtonAction from './ButtonAction.vue';

  const props = defineProps({
    assets: Object,
    volume: Number
  });
</script>

<template>
  <ButtonAction class="action" title="Discord Server">
    <img :src="'./svg/discord.svg'">
  </ButtonAction>
</template>

<style lang="scss" scoped>
  .action {
    :deep(img) {
      filter: invert(1);
      width: 1.5em;
      height: 1.5em;
    }
  }
</style>