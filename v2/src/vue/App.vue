<script setup>
  import '../scss/Global.scss';
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router'
  import { Game } from '../js/core/Game.js';
  import Loading from './Loading.vue';

  // Initialize app and expose to window scope
  const loaded = ref(false);
  const canvas = ref();
  const game = window.game = new Game(onLoad);
  const route = useRoute();

  // Update loaded state before mounting pages
  function onLoad() {
    loaded.value = true;
  }

  // Initialize app after canvas has been mounted
  onMounted(function() {
    game.init(canvas.value);
  });
</script>

<template>
  <!-- Canvas behind every page -->
  <canvas ref="canvas"></canvas>

  <!-- Render page component using Routes.js -->
  <div class="page" :class="route.name" v-if="loaded">
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" :game="game" />
      </transition>
    </router-view>
  </div>

  <!-- Loading screen is global -->
  <Loading />
</template>

<style lang="scss" scoped>
  canvas {
    background-color: #333333;
    height: 100%;
    image-rendering: pixelated;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 0;
  }

  .page {
    height: 100%;
    left: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;

    > * {
      pointer-events: all;
    }

    .fade-enter-active,
    .fade-leave-active { transition: opacity 0.5s ease; }
    .fade-enter-from,
    .fade-leave-to { opacity: 0; }
  }
</style>