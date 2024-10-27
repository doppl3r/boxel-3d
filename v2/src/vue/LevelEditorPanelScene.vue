<script setup>
  import { onMounted, ref } from 'vue';

  const expanded = ref(true);

  // Initialize app and expose to window scope
  const props = defineProps({
    entities: Object
  });
  
  // Initialize app after canvas has been mounted
  onMounted(function() {
    
  });
</script>

<template>
  <div class="panel scene">
    <div class="header">
      <div class="title" @click="expanded = !expanded">Scene</div>
      <div class="actions">
        <div class="action button" title="Play level">
          <span class="material-symbols-rounded">play_arrow</span>
        </div>
        <div class="action button" title="Settings">
          <span class="material-symbols-rounded">settings</span>
        </div>
      </div>
    </div>
    <div class="entities" v-show="expanded == true">
      <div class="entity" v-for="[key, value] in props.entities" :key="key">
        <div class="icon" :class="value.type"></div>
        {{ value.type }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  ::-webkit-scrollbar { width: 0.25em; }
  ::-webkit-scrollbar-track { background: rgba(#FFA217, 1); border-radius: 99em; }
  ::-webkit-scrollbar-thumb { background: rgba(#000000, 1); border-radius: 99em; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(#F52D59, 1); border-radius: 99em; }

  .scene {
    border-radius: 0.5em;
    background-color: #FFCB4C;
    border: 0.25em solid #000000;
    box-shadow: 0 0.25em 0 #000000;
    padding: 0.5em;
    position: absolute;
    right: 1em;
    top: 1em;
    width: 10em;

    .header {
      align-items: center;
      display: flex;

      .title {
        flex-grow: 1;
      }

      .actions {
        align-items: center;
        display: flex;
        gap: 0.125em;

        .action {
          align-items: center;
          border-radius: 0.25em;
          cursor: pointer;
          display: flex;
          height: 1em;
          justify-content: center;
          width: 1em;

          &:hover {
            background-color: #F52D59;
          }

          .material-symbols-rounded {
            font-size: 1em;
          }
        }
      }
    }

    .entities {
      display: flex;
      flex-direction: column;
      gap: 0.125em;
      margin-top: 0.25em;
      overflow-y: auto;
      padding-right: 0.5em;
      height: 8em;

      .entity {
        align-items: center;
        background-color: #FFA217;
        border-radius: 0.25em;
        cursor: pointer;
        display: flex;
        font-size: 1em;
        line-height: 1.5em;
        padding: 0 0.25em;

        &:hover {
          background-color: #F52D59;
        }

        &.selected {
          background-color: #000000;
          color: #ffffff;
        }
      }
    }
  }
</style>