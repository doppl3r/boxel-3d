<script setup>
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import levelData from '../json/levels.json';
  
  // Initialize attributes
  const i18n = useI18n({ useScope: 'global' });
  const packs = computed(() => {
    // Set array from level data
    const arr = levelData.packs;

    // Add "All" as a pack option
    arr.unshift({ title: 'All', levels: [] })

    // Return array of level packs
    return arr;
  });
  const levels = computed(() => {
    // Return a shallow array of levels and their pack Data
    const arr = [];

    // Loop through each pack
    packs.value.forEach(pack => {
      // Add objects to levels array
      pack.levels.forEach(level => {
        // Return level objects with their theme data
        arr.push({
          ...level,
          pack: pack.title,
          thumbnail: {
            url: pack.url
          }
        });
      });
    });

    // Return array of levels
    return arr;
  });
  const selectedPack = ref(packs.value[0]);
  const selectedLevel = ref(levels.value[0]);

  const search = ref('');
  var isOpen = ref(true);

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('openPopup', openPopup);
	  window.addEventListener('closePopup', closePopup);
    window.addEventListener('keydown', keydown);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('openPopup', openPopup);
	  window.removeEventListener('closePopup', closePopup);
    window.removeEventListener('keydown', keydown);
  }

  function openPopup(e) {
    isOpen.value = true;
  }

  function closePopup() {
    isOpen.value = false;
  }

  function keydown(e) {
    if (isOpen.value == true) {
      
    }
  }

  onMounted(function() {
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <Transition name="fade">
    <div class="level-selector" v-if="isOpen == true">
      <div class="level-selector__background" @click="closePopup()"></div>
      <div class="level-selector__container">
        <div class="level-selector__packs">
          <div class="level-selector__packs-header">{{ i18n.t('popup.text.level_packs') }}</div>
          <ul class="level-selector__packs-list">
            <li v-for="pack in packs">
              <button>
                <img v-if="pack.url" :src="pack.url" :alt="pack.title" />
                <span>{{ pack.title }}</span>
              </button>
            </li>
          </ul>
        </div>
        <div class="level-selector__levels">
          <div class="level-selector__levels-header">
            <input class="level-selector__search" v-model="search" :placeholder="`${ i18n.t('popup.text.search') }...`" type="text">
          </div>
          <ul class="level-selector__levels-list">
            <li v-for="level in levels">
              <button>
                <img v-if="level.thumbnail.url" :src="level.thumbnail.url" :alt="level.title" />
                <span>{{ level.description }}</span>
              </button>
            </li>
          </ul>
        </div>
        <div class="level-selector__info">
          <div class="level-selector__info-header">{{ i18n.t('popup.text.info') }}</div>
          <div class="level-selector__info-content">
            <img :src="selectedLevel.thumbnail.url" :alt="selectedLevel.description" />
            <div class="level-selector__info-details">
              <span>By {{ selectedLevel.author || 'Doppler' }}</span>
            </div>
            <button class="level-selector__info-play">
              <span class="material-symbols-rounded">play_arrow</span>
              <span>{{ i18n.t('popup.button.play') }}</span>
            </button>
          </div>
        </div>
        <a class="level-selector__close" @click="closePopup()" :title="i18n.t('popup.button.close')">
          <span class="material-symbols-rounded">close</span>
        </a>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.1s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .level-selector {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    overflow: hidden;
    padding: 2.5em;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;

    /* Scrollbar */
    ::-webkit-scrollbar { width: 0.25em; }
    ::-webkit-scrollbar-track { background: rgba(#000000, 0.25); border-radius: 99em; }
    ::-webkit-scrollbar-thumb { background: rgba(#FFC24C, 1); border-radius: 99em; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(#FFFFFF, 1); border-radius: 99em; }

    .level-selector__background {
      background-color: rgba(#000000, 0.5);
      height: inherit;
      left: 0;
      position: absolute;
      top: 0;
      width: inherit;
    }

    .level-selector__container {
      background-color: #9F00FF;
      border-radius: 0.75em;
      box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
      display: flex;
      gap: 0.5em;
      height: 17.5em;
      padding: 0.5em;
      position: relative;
      width: 35em;

      ul {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        list-style: none;
        overflow-y: auto;
        padding-right: 0.5em;

        li {
          font-size: 1em;
          padding: 0;

          &:before {
            content: initial;
          }

          button {
            align-items: center;
            background-color: rgba(#000000, 0.1);
            border-width: 0;
            border-radius: 0.5em;
            color: #ffffff;
            cursor: pointer;
            display: flex;
            font-family: inherit;
            font-size: 1em;
            gap: 0.5em;
            height: 2em;
            justify-content: flex-start;
            padding: 0.25em;
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            white-space: nowrap;
            width: 100%;

            img {
              box-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
              border-radius: 0.25em;
              height: 1.5em;
              width: 1.5em;
            }

            span {
              font-size: 0.75em;
            }
          }
        }
      }

      .level-selector__packs {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        height: 100%;
        width: 9.75em;

        .level-selector__packs-header {
          color: #ffffff;
          font-size: 1em;
          line-height: 2em;
          text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
        }
      }

      .level-selector__levels {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        height: 100%;
        width: 17em;

        .level-selector__levels-header {
          font-size: 1em;
          line-height: 2em;

          .level-selector__search { // <input>

          }
        }
      }

      .level-selector__info {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        height: 100%;
        width: 6.25em;

        .level-selector__info-header {
          color: #ffffff;
          font-size: 1em;
          line-height: 2em;
          text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
        }

        .level-selector__info-content {
          align-items: center;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          gap: 0.5em;
          justify-content: center;
          padding-bottom: 1em;
          position: relative;

          img {
            border-radius: 0.5em;
            box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
          }

          .level-selector__info-details {
            background-color: rgba(#000000, 0.1);
            border-radius: 0.5em;
            color: #ffffff;
            flex-grow: 1;
            font-size: 0.75em;
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            padding: 0.5em;
            width: 100%;
          }

          .level-selector__info-play {
            align-items: center;
            background-color: #4CA9FF;
            border-radius: 99em;
            border-width: 0;
            box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
            color: #ffffff;
            cursor: pointer;
            display: flex;
            font-family: inherit;
            font-size: 1em;
            gap: 0.5em;
            height: 2em;
            padding: 0.5em;
            position: absolute;
            left: 50%;
            bottom: -1.5em;
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            transform: translateX(-50%);

            .material-symbols-rounded {
              background-color: #000000;
              border-radius: 0.5em;
              font-size: 1em;
              width: 1em;
              height: 1em;
            }
          }
        }
      }

      .level-selector__close {
        align-items: center;
        background-color: #FFC24C;
        border-radius: 0.5em;
        box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
        color: #EB2B6D;
        display: flex;
        height: 2em;
        justify-content: center;
        position: absolute;
        right: 0;
        top: 0;
        transform: translate(50%, -50%);
        width: 2em;
      }
    }
  }
</style>