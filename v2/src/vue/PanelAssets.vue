<script setup>
  import { computed, ref } from 'vue';

  // Declare component variables
  const emit = defineEmits(['addEntity']);
  const props = defineProps({
    cache: Object,
    mode: Object
  });
  const expanded = ref(false);
  const assets = computed(() => getAssets(props.cache));
  const isVisible = computed((previous) => {
    if (props.mode.type == 'add') expanded.value = !previous;
    else expanded.value = false;
    return expanded.value;
  });

  function getAssets(cache) {
    // Return an array of assets from game cache
    return Object.keys(cache)
      .filter(key => {
        // Only include assets with isAsset flag
        const asset = cache[key];
        if (asset.userData.isAsset) return asset;
      })
      .map(key => {
        // Return a new object with basic data
        const asset = cache[key];
        return {
          key: key,
          src: asset.thumbnail
        };
      }
    );
  }

  function addEntity(e, asset) {
    emit('addEntity', e, asset);
  }

  function close() {
    expanded.value = false;
  }
</script>

<template>
  <div class="panel" v-show="isVisible">
    <div class="header">
      <div class="title">Add</div>
    </div>
    <div class="assets">
      <button class="asset" v-for="asset in assets" :title="asset.key" @click="addEntity($event, asset)">
        <img :src="asset.src" />
      </button>
    </div>
    <button class="close" @click="close">x</button>
  </div>
</template>

<style lang="scss" scoped>
  ::-webkit-scrollbar { width: 0.25em; }
  ::-webkit-scrollbar-track { background: rgba(#FFA217, 1); border-radius: 99em; }
  ::-webkit-scrollbar-thumb { background: rgba(#000000, 1); border-radius: 99em; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(#F52D59, 1); border-radius: 99em; }

  .panel {
    border-radius: 0.5em;
    background-color: #FFCB4C;
    border: 0.25em solid #000000;
    box-shadow: 0 0.25em 0 #000000;
    padding: 0.5em;
    position: absolute;
    left: 3.25em;
    top: 1em;
    width: 10.625em;

    .header {
      align-items: center;
      display: flex;

      .title {
        flex-grow: 1;
      }
    }

    .assets {
      display: flex;
      flex-wrap: wrap;
      gap: 0.125em;
      height: 6.25em;
      margin-top: 0.25em;
      overflow-y: auto;
      padding-right: 0.5em;

      .asset {
        align-items: center;
        background-color: #FFA217;
        border-radius: 0.5em;
        border-width: 0;
        cursor: pointer;
        display: flex;
        font-size: 1em;
        height: 2em;
        padding: 0.25em;
        transition-duration: 0.1s;
        transition-property: transform, background-color;
        transition-timing-function: ease-in-out;
        width: 2em;

        &:active {
          background-color: #F52D59;

          img {
            transform: scale(0.75);
          }
        }

        &.selected {
          background-color: #000000;
          color: #ffffff;
        }

        img {
          width: 100%;
          height: 100%;
          transition: inherit;
          pointer-events: none;
        }
      }
    }

    .close {
      align-items: center;
      background-color: #F52D59;
      border: 0.25em solid #000000;
      border-radius: 99em;
      box-shadow: 0 0.25em 0 #000000;
      color: #000000;
      display: flex;
      font-family: inherit;
      height: 1.5em;
      justify-content: center;
      position: absolute;
      right: 0;
      top: 0;
      transform: translate(50%, -50%);
      width: 1.5em;

      &:hover {
        background-color: #FFA217;
      }
    }
  }
</style>