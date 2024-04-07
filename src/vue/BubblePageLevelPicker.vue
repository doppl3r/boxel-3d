<script setup>
  import { ref, onBeforeMount, onMounted, onUnmounted } from 'vue';
  import BubbleButtonSettings from './BubbleButtonSettings.vue';
  import BubbleCarousel from './BubbleCarousel.vue';
  import levels from '../json/levels.json';
  import themes from '../json/themes.json';

  // Initialize variables
  var description = ref('Select a level');
  var items = ref([]); // Carousel items
  var key = ref(0);
  var selectedItem = ref();
  var scores = app.storage.getScores();
  var settings = app.storage.getSettings();
  var progress = parseInt(settings.progress);
  var origin = ref(location.origin);
  var pathname = ref(location.pathname.includes('.') ? '/' : location.pathname);
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
    var response = await fetch(origin.value + pathname.value + '/json/' + title + '.json');
    var json = await response.json();
    var credit = '';
    var theme = themes[selectedItem.value.theme];
    emit('setPage', 'campaign');
    app.updateGravity();
    app.play = true;
    app.timer.reset();
    if (json.author) credit = 'Level by ' + json.author;
    if (json.star) credit = '<img src="img/svg/star.svg" title="Event winner"> ' + credit;
    if (theme) app.level.entityFactory.color = theme.color;
    app.background.setTheme(theme.model);
    app.level.clearLevel(app);
    app.level.importFromJSON(json, app);
    settings.progress = getLevelIndex(title) + 1;
    app.updateSettings(settings);
    app.playLevel();
    app.resetScene();
    
    // Send event to show credits
    setTimeout(function() {
      window.dispatchEvent(new CustomEvent('setCredit', { detail: { text: credit }}));
    }, 500);
  }

  function getScore(title) {
    return scores[title];
  }

  function getLevelIndex(title) {
    var count = 0;
    var index = -1;
    
    // Loop through packs array
    levels.packs.forEach(function(pack) {
      // Loop through each levels array
      pack.levels.forEach(function(level) {
        // Set level index and increment count
        if (title == level.title) {
          index = count;
        }
        count++;
      });
    });
    return index;
  }

  function updateSelectedItem(e) {
    if (selectedItem.value == e.detail) playSelectedItem();
    selectedItem.value = e.detail;
    updateDescription();
  }

  function updateDescription() {
    var index = getLevelIndex(selectedItem.value.title);
    var count = 0;

    // Loop through packs array
    levels.packs.forEach(function(pack) {
      // Loop through each levels array
      pack.levels.forEach(function(level) {
        // Set title and increment count
        if (index == count) {
          description.value = pack.title;
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

    // Loop through packs array
    levels.packs.forEach(function(pack) {
      // Loop through each levels array
      pack.levels.forEach(function(level) {
        // Set title and increment count
        if (index == count) {
          selectedItem.value = level;
        }
        count++;
      });
    });
  }

  function exitLevelPicker() {
    emit('setPage', 'home');
  }

  function setItems() {
    items.value = []; // Empty array
    levels.packs.forEach(function(pack, i) {
      var url = pack.url;
      pack.levels.forEach(function(item, j) {
        var score = getScore(item.title);
        if (score) item.tag = '<span class="material-symbols-rounded">star</span>' + getScore(item.title);
        item.url = url; // Assign pack image
        item.theme = pack.theme;
        items.value.push(item);
      })
    });
  }

  function keydown(e) {
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

  onBeforeMount(function() {
    setItems();
    setSelectedItem();
  });
  
  // Run function after being mounted (visible)
  onMounted(function() {
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="page">
    <div class="background">
      <img src="/img/svg/background-purple.svg">
    </div>
    <div class="nav">
      <a class="button fade-in" @click="exitLevelPicker" title="Exit to home (ESC)">
        <span class="material-symbols-rounded">undo</span>
      </a>
      <BubbleButtonSettings class="button right fade-in" />
    </div>
    <div class="content fade-in">
      <h1>Play</h1>
      <p>{{ description }}</p>
      <BubbleCarousel :items="items" :selected="selectedItem" :key="key" />
    </div>
    <div class="footer">
      <a class="button center fade-in" @click="playSelectedItem">
        <span class="material-symbols-rounded">slideshow</span>
        Play
      </a>
    </div>
  </div>
</template>