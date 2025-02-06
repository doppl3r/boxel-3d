<script setup>
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import levelData from '../json/levels.json';
  
  // Initialize attributes
  const isOpen = ref(true);
  const i18n = useI18n({ useScope: 'global' });

  // Set packs and levels from level data
  const packsRef = ref([]);
  const packs = computed(() => {
    // Set array from level data
    const arr = [...levelData.packs];
    
    // Add "All" as a pack option
    arr.unshift({ title: 'All', levels: [] })
    
    // Return array of level packs
    return arr;
  });

  const levelsRef = ref([]);
  const levels = computed(() => {
    // Return a shallow array of levels and their pack Data
    const arr = [];

    // Loop through each pack and level
    packs.value.forEach(pack => {
      pack.levels.forEach(level => {
        // Add level objects with their pack data
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

  // Set selected level and pack from settings
  const scores = app.storage.getScores();
  const settings = app.storage.getSettings();
  const selectedLevel = ref(levels.value[settings.progress - 1]);
  const selectedPack = ref(packs.value.find(pack => pack.title == selectedLevel.value.pack));

  // Set search logic from search values
  const search = ref('');
  const filteredLevels = computed(() => levels.value.filter(level =>
    // Evaluate true if any object value matches
    Object.values(level).some(val => val?.toString().toLowerCase().includes(search.value.toLowerCase()))
  ));

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

  function isVisible(level) {
    const hasMatchingPack = selectedPack.value.title == level.pack;
    const hasAllSelected = selectedPack.value.title == 'All';
    return hasMatchingPack || hasAllSelected;
  }

  function selectPack(pack) {
    selectedPack.value = pack;
  }

  function selectLevel(level) {
    selectedLevel.value = level;
  }

  function clearSearch() {
    search.value = '';
  }

  async function playSelectedLevel() {
    await app.playLevelByTitle(selectedLevel.value.title);
    window.dispatchEvent(new CustomEvent('setPage', { detail: 'campaign' }));
    const progress = levels.value.findIndex(level => level.title == selectedLevel.value.title) + 1;
    settings.progress = progress;
    app.updateSettings(settings);
  }

  function scrollToSelected(needle, haystack, ref, key) {
    const index = haystack.value.findIndex(item => item[key] == needle.value[key]);
    if (ref.value[index]) {
      ref.value[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function getScore(title) {
    return scores[title];
  }

  watch(selectedPack, () => {
    // Scroll to selected items after next render
    nextTick(() => {
      scrollToSelected(selectedPack, packs, packsRef, 'title');
      scrollToSelected(selectedLevel, levels, levelsRef, 'title');
    });
  });

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
            <template v-for="pack in packs" :key="pack.title">
              <li ref="packsRef">
                <button :class="{ selected: selectedPack.title == pack.title }" @click="selectPack(pack)">
                  <img v-if="pack.url" :src="pack.url" :alt="pack.title" />
                  <span>{{ pack.title }}</span>
                </button>
              </li>
            </template>
          </ul>
        </div>
        <div class="level-selector__levels">
          <div class="level-selector__levels-header">
            <input class="level-selector__search" v-model="search" :placeholder="`${ i18n.t('popup.text.search') }...`" type="text">
            <button class="search-icon" tabindex="-1">
              <span class="material-symbols-rounded">search</span>
            </button>
            <button class="clear-icon" @click="clearSearch()" v-if="search.length > 0">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>
          <ul class="level-selector__levels-list">
            <template v-for="level in filteredLevels" :key="level.title">
              <li v-show="isVisible(level)" ref="levelsRef">
                <button :class="{ selected: selectedLevel.title == level.title }" @click="selectLevel(level)">
                  <img v-if="level.thumbnail.url" :src="level.thumbnail.url" :alt="level.title" />
                  <span>{{ level.description }}</span>
                  <div class="score" v-if="getScore(level.title)">
                    <span class="material-symbols-rounded">star</span>
                    <span>{{ getScore(level.title) }}</span>
                  </div>
                </button>
              </li>
            </template>
          </ul>
        </div>
        <div class="level-selector__info">
          <div class="level-selector__info-header">{{ i18n.t('popup.text.info') }}</div>
          <div class="level-selector__info-content">
            <img :src="selectedLevel.thumbnail.url" :alt="selectedLevel.description" />
            <div class="level-selector__info-details">
              <span>Level by {{ selectedLevel.author || 'Doppler' }}</span>
            </div>
            <button class="level-selector__info-play" @click="playSelectedLevel()">
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
    ::-webkit-scrollbar-track { background: rgba(#000000, 0.1); border-radius: 99em; }
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
        height: 100%;
        list-style: none;
        overflow-y: scroll;
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
            gap: 0.25em;
            height: 2em;
            justify-content: flex-start;
            padding: 0.25em;
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            white-space: nowrap;
            width: 100%;

            &:hover,
            &.selected {
              background-color: #4CA9FF;
            }

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
          color: #ffffff;
          font-size: 1em;
          line-height: 2em;
          padding-right: 0.75em;
          position: relative;

          .level-selector__search { // <input>
            background-color: rgba(#000000, 0.1);
            border-width: 0;
            border-radius: 0.5em;
            color: inherit;
            height: 2em;
            font-family: inherit;
            outline: none;
            padding: 0.25em 2em 0.25em 2em;
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            width: 100%;

            &::placeholder {
              color: inherit;
              opacity: 0.5;
            }
          }

          button {
            align-items: center;
            background-color: transparent;
            border-width: 0;
            color: inherit;
            cursor: pointer;
            display: flex;
            font-size: 1em;
            height: 2em; 
            justify-content: center;
            padding: 0;
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            width: 2em;

            &.search-icon {
              pointer-events: none;
              position: absolute;
              top: 0;
              left: 0;
            }
  
            &.clear-icon {
              position: absolute;
              top: 0;
              right: 0.75em;
            }
          }
        }

        .level-selector__levels-list {
          .material-symbols-rounded {
            color: #FFC24C;
            font-size: 1.5em;
          }

          .score {
            align-items: center;
            display: flex;
            margin-left: auto;
            text-align: left;
            flex-basis: 5em;
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
            padding: 0.5em;
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            width: 100%;
            word-wrap: break-word;
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