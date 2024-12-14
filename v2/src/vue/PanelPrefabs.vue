<script setup>
  import { computed, onMounted, ref } from 'vue';

  // Declare component variables
  const emit = defineEmits(['addEntity']);
  const props = defineProps({
    game: Object,
    mode: Object
  });
  const json = ref({});
  const expanded = ref(false);
  const prefabs = computed(() => getPrefabs());
  const isVisible = computed((previous) => {
    if (props.mode.type == 'add') expanded.value = !previous;
    else expanded.value = false;
    return expanded.value;
  });

  function getPrefabs() {
    // Return an array of prefabs with thumbnails
    return Object.keys(json.value).map(key => {
      const prefab = json.value[key];
      const model = props.game.assets.get(prefab.model.name);
      prefab.thumbnail = props.game.assets.assetModelLoader.renderThumbnail(model);
      return prefab;
    });
  }

  async function loadFile(path) {
    // Fetch public folder for level
    return fetch(path).then(function (response) {
      if (response.ok) { return response.json(); }
      throw new Error('Something went wrong');
    })
    .then(function(json) { return json; })
    .catch(function(error) { console.error(error); });
  }

  function addEntity(e, prefab) {
    emit('addEntity', e, prefab);
  }

  function close() {
    expanded.value = false;
  }

  onMounted(async () => {
    json.value = props.game.assets.get('prefabs');
  });
</script>

<template>
  <div class="panel" v-show="isVisible">
    <div class="header">
      <div class="title">Add</div>
    </div>
    <div class="prefabs">
      <button class="prefab" v-for="prefab in prefabs" :title="prefab.className" @click="addEntity($event, prefab)">
        <img :src="prefab.thumbnail" />
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

    .prefabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.125em;
      height: 6.25em;
      margin-top: 0.25em;
      overflow-y: auto;
      padding-right: 0.5em;

      .prefab {
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