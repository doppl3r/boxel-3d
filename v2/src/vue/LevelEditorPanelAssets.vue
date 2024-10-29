<script setup>
  import { onMounted, ref, watch } from 'vue';

  // Declare component variables
  const props = defineProps({
    assets: Object,
    mode: Object
  });
  const visible = ref(false);
  const entities = ref([]);

  function loadAssets() {
    // Loop through each asset
    for (var key in props.assets.cache) {
      var asset = props.assets.get(key);
      if (asset.userData.isEntity) {
        entities.value.push({
          key: key,
          src: asset.thumbnail
        });
      }
    }
  }

  function close() {
    visible.value = false;
  }

  watch(() => props.mode, (after, before) => {
    if (after.type == 'add') {
      // Show if previous mode was not "add"
      if (before.type != after.type) {
        visible.value = true;
      }
      else {
        // Toggle visibility if previous mode is the same
        visible.value = !visible.value
      }
    }
    else {
      // Hide if mode is not "add"
      visible.value = false;
    }
  })
  
  // Initialize component values on mounted
  onMounted(function() {
    loadAssets();
  });
</script>

<template>
  <div class="panel assets" v-show="visible == true">
    <div class="header">
      <div class="title">Add</div>
    </div>
    <div class="entities">
      <div class="entity" v-for="entity in entities" :title="entity.key">
        <img :src="entity.src" />
      </div>
    </div>
    <div class="close" @click="close">x</div>
  </div>
</template>

<style lang="scss" scoped>
  ::-webkit-scrollbar { width: 0.25em; }
  ::-webkit-scrollbar-track { background: rgba(#FFA217, 1); border-radius: 99em; }
  ::-webkit-scrollbar-thumb { background: rgba(#000000, 1); border-radius: 99em; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(#F52D59, 1); border-radius: 99em; }

  .assets {
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

    .entities {
      display: flex;
      flex-wrap: wrap;
      gap: 0.125em;
      height: 6.25em;
      margin-top: 0.25em;
      overflow-y: auto;
      padding-right: 0.5em;

      .entity {
        align-items: center;
        background-color: #FFA217;
        border-radius: 0.5em;
        cursor: pointer;
        display: flex;
        font-size: 1em;
        height: 2em;
        padding: 0.25em;
        width: 2em;

        &:hover {
          background-color: #F52D59;
        }

        &.selected {
          background-color: #000000;
          color: #ffffff;
        }

        img {
          width: 100%;
          height: 100%;
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