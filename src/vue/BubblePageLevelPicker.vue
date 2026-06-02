<script setup>
  import { ref, onBeforeMount, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Utility } from '../js/Utility.js';
  import BubbleButtonSettings from './BubbleButtonSettings.vue';
  import BubbleCarousel from './BubbleCarousel.vue';
  import BubblePopupLevelSelector from './BubblePopupLevelSelector.vue';
  import { levels, themes } from '../js/Data.js';

  // Initialize variables
  const i18n = useI18n({ useScope: 'global' });
  const util = new Utility();
  var description = ref('Select a level');
  var items = ref([]); // Carousel items
  var selectedItem = ref();
  var scores = app.storage.getScores();
  var settings = app.storage.getSettings();
  var progress = parseInt(settings.progress);
  var preventAutoPlay = false;
  var emit = defineEmits(['setPage']);

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('keydown', keydown);
    window.addEventListener('itemSelected', updateSelectedItem);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('itemSelected', updateSelectedItem);
  }

  async function playSelectedItem() {
    await app.playLevel({ ...selectedItem.value });
    emit('setPage', 'campaign');
  }

  function getScore(key) {
    return scores[key];
  }

  function getThumbnail(key) {
    return app.storage.getThumbnail(key);
  }

  function updateSelectedItem(e) {
    // Open the settings data page if the add button is clicked
    if (e.detail?.class === 'add-button') {
      preventAutoPlay = true;
      window.dispatchEvent(new CustomEvent('openSettings', { detail: 'data:levelPacks' }));
      return;
    }

    // Prevent playing level if opening settings, but still update selected item
    if (preventAutoPlay) preventAutoPlay = false;
    else if (selectedItem.value == e.detail) playSelectedItem();
    selectedItem.value = e.detail;
    settings = app.storage.getSettings();
    settings.progress = app.level.getLevelIndex(selectedItem.value.title) + 1;
    app.updateSettings(settings);
    updateDescription();
  }

  function updateDescription() {
    var index = app.level.getLevelIndex(selectedItem.value.title);
    var count = 0;

    // Loop through packs array
    levels.packs.forEach(function(pack) {
      // Loop through each levels array
      pack.levels.forEach(function(level) {
        // Set title and increment count
        if (index == count) {
          description.value = `${pack.title}: <em>${ selectedItem.value.description || selectedItem.value.title }</em>`;

          if (pack.links) {
            pack.links.forEach(function(link) {
              description.value += ' - <a class="' + link.class + '" href="' + link.url + '" target="' + link.target + '"><img src="' + link.icon + '"> ' + link.text + '</a>'
            });
          }
        }
        count++;
      });
    });
  }

  function setSelectedItem() {
    var index = progress - 1;
    var count = 0;
    var last = {};

    // Loop through packs array
    levels.packs.forEach(function(pack) {
      // Loop through each levels array
      pack.levels.forEach(function(level) {
        // Store temp reference to last level
        last = level;

        // Set title and increment count
        if (index == count || index == count + 1) { // count + 1 == last item
          selectedItem.value = level;
        }
        count++;
      });
    });

    // Limit progress to max level count
    if (selectedItem.value == undefined) {
      progress = count;
      selectedItem.value = last;
    };
  }

  function exitLevelPicker() {
    emit('setPage', 'home');
  }

  function setItems() {
    items.value = []; // Empty array
    levels.packs.forEach(function(pack, i) {
      pack.levels.forEach(function(item, j) {
        // Update image url
        let key = item.publishedFileId || item.title;
        let url = themes[pack.theme].thumbnail;
        let screenshot = getThumbnail(key);
        if (screenshot != null) url = screenshot;
        if (item.thumbnail) url = item.thumbnail;

        // Update score
        let score = getScore(key);
        if (score) item.tag = '<span class="material-symbols-rounded">star</span>' + '<span>' + score + '</span>';
        else item.tag = '<span class="material-symbols-rounded">more_horiz</span>';

        // Assign item values
        item.url = url;
        item.subtitle = item.description || item.title;
        item.theme = pack.theme;
        items.value.push(item);
      })
    });

    // Add button to load more levels via settings
    items.value.push({
      class: 'add-button',
      label: 'Add',
      subtitle: 'Level Packs',
      url: '../svg/button-level-pack.svg',
    });
  }

  function openLevelSelector() {
    window.dispatchEvent(new CustomEvent('openLevelSelectorPopup'));
  }

  function openDiscord() {
    util.openLink('https://discord.gg/j8fvd4UvbE', '_blank');
  }

  function keydown(e) {
    // Ignore events from inputs
    if (e.target.value == null) {
      var jumpKeys = ['Space', 'Enter', 'ArrowUp', 'KeyW'];
      if (jumpKeys.indexOf(e.code) > -1) {
        e.preventDefault(); // Prevent scrolling
        playSelectedItem();
      }
      
      if (e.code == 'Escape' || e.code == 'KeyE') {
        e.preventDefault();
        exitLevelPicker();
      }
    }
  }

  onBeforeMount(function() {
    setItems();
    setSelectedItem();
    updateDescription();
  });
  
  // Run function after being mounted (visible)
  onMounted(function() {
    addEventListeners();

    // Dispatch ready event to listeners
    window.dispatchEvent(new CustomEvent('pageMounted', { detail: 'level-picker' }));
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="page">
    <div class="background">
      <img :src="'../svg/background-purple.svg'">
    </div>
    <div class="nav">
      <a class="button fade-in" @click="exitLevelPicker" :title="i18n.t('level_picker.button.exit')">
        <span class="material-symbols-rounded">undo</span>
      </a>
      <a class="button fade-in right" @click="openLevelSelector" :title="i18n.t('popup.text.search')">
        <span class="material-symbols-rounded">search</span>
      </a>
      <a class="button fade-in" @click="openDiscord" :title="i18n.t('level_picker.button.discord')">
        <img :src="'../svg/discord.svg'">
      </a>
      <BubbleButtonSettings class="button fade-in" />
    </div>
    <div class="content fade-in">
      <h1>{{ i18n.t('level_picker.title') }}</h1>
      <p v-html="description"></p>
      <BubbleCarousel
        :items="items"
        :selected="selectedItem"
        :hideTitle="true"
      />
      <div class="footer">
        <div class="center">
          <a class="button fade-in" @click="playSelectedItem">
            <span class="material-symbols-rounded">slideshow</span>
            {{ i18n.t('level_picker.button.play') }}
          </a>
        </div>
      </div>
    </div>

    <BubblePopupLevelSelector />
  </div>
</template>

<style lang="scss" scoped>
  .ui-bubble {
    .page {
      .content {
        padding-bottom: 0;

        p {
          margin-bottom: 0;
        }

        :deep(.carousel) {
          .item {
            padding-bottom: 0;
          }
        }
      }
      
      .footer {
        padding: 1em 0 0;
        position: relative;
      }
    }
  }
</style>