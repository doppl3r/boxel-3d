<script setup>
  import { ref, onBeforeMount, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BubbleButtonSettings from './BubbleButtonSettings.vue';
  import BubbleCarousel from './BubbleCarousel.vue';
  import BubblePopupLevelSelector from './BubblePopupLevelSelector.vue';
  import levels from '../json/levels.json';
  import themes from '../json/themes.json';

  // Initialize variables
  const i18n = useI18n({ useScope: 'global' });
  var description = ref('Select a level');
  var items = ref([]); // Carousel items
  var key = ref(0);
  var selectedItem = ref();
  var scores = app.storage.getScores();
  var settings = app.storage.getSettings();
  var progress = parseInt(settings.progress);
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

  async function playLevel(title) {
    await app.playLevelByTitle(title);
    emit('setPage', 'campaign');
  }

  function getScore(title) {
    return scores[title];
  }

  function updateSelectedItem(e) {
    if (selectedItem.value == e.detail) playSelectedItem();
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
          description.value = pack.title;

          if (pack.links) {
            pack.links.forEach(function(link) {
              description.value += ' <a class="' + link.class + '" href="' + link.url + '" target="' + link.target + '"><img src="' + link.icon + '"> ' + link.text + '</a>'
            })
          }
        }
        count++;
      });
    });
  }

  function playSelectedItem() {
    playLevel(selectedItem.value.title);
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
      var url = themes[pack.theme].thumbnail;
      pack.levels.forEach(function(item, j) {
        var score = getScore(item.title);
        if (score) item.tag = '<span class="material-symbols-rounded">star</span>' + getScore(item.title);
        item.url = url; // Assign pack image
        item.theme = pack.theme;
        items.value.push(item);
      })
    });
  }

  function openLevelSelector() {
    window.dispatchEvent(new CustomEvent('openLevelSelectorPopup'));
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
      <BubbleButtonSettings class="button right fade-in" />
    </div>
    <div class="content fade-in">
      <h1>{{ i18n.t('level_picker.title') }}</h1>
      <p v-html="description"></p>
      <BubbleCarousel :items="items" :selected="selectedItem" :key="key" />
    </div>
    <div class="footer">
      <div class="center">
        <a class="button fade-in" @click="openLevelSelector">
          <span class="material-symbols-rounded">identity_platform</span>
          {{ i18n.t('popup.text.info') }}
        </a>
        <a class="button fade-in" @click="playSelectedItem">
          <span class="material-symbols-rounded">slideshow</span>
          {{ i18n.t('level_picker.button.play') }}
        </a>
      </div>
    </div>

    <BubblePopupLevelSelector />
  </div>
</template>