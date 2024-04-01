<script setup>
  import { ref, onBeforeMount, onMounted, onUnmounted } from 'vue';
  import BubbleButtonSettings from './BubbleButtonSettings.vue';
  import BubbleCarousel from './BubbleCarousel.vue';
  import levels from '../json/levels.json';

  // Initialize variables
  var items = ref([]); // Carousel items
  var selectedPack = ref();
  var scores = app.storage.getScores();
  var settings = app.storage.getSettings();
  var progress = parseInt(settings.progress);
  var progressTitle = getLevelTitle(progress - 1);
  var origin = ref(location.origin);
  var pathname = ref(location.pathname.includes('.') ? '/' : location.pathname);
  var emit = defineEmits(['setPage']);

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('keydown', keydown);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('keydown', keydown);
  }

  async function playLevel(title) {
    var response = await fetch(origin.value + pathname.value + '/json/' + title + '.json');
    var json = await response.json();
    var credit = '';
    emit('setPage', 'campaign');
    app.updateGravity();
    app.play = true;
    app.timer.reset();
    if (json.author) credit = 'Level by ' + json.author;
    if (json.star) credit = '<img src="img/svg/star.svg" title="Event winner"> ' + credit;
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

  function getLevelTitle(index) {
    var title;
    var count = 0;

    // Loop through packs array
    levels.packs.forEach(function(pack) {
      // Loop through each levels array
      pack.levels.forEach(function(level) {
        // Set title and increment count
        if (index == count) title = level.title;
        count++;
      });
    });
    return title;
  }

  function updateSelectedPack(index) {
    var count = 0;
    var id = 0;

    // Loop through packs array
    levels.packs.forEach(function(pack) {
      // Loop through each levels array
      pack.id = 'pack-' + id;
      pack.levels.forEach(function() {
        // Set title and increment count
        if (index == count) {
          selectedPack.value = pack;
        }
        count++;
      });
      id++;
    });
  }

  function exitLevelPicker() {
    emit('setPage', 'home');
  }

  function updateProgressTitle(e) {
    progressTitle = e.target.getAttribute('title');
  }

  function keydown(e) {
    var jumpKeys = ['Space', 'Enter', 'ArrowUp', 'KeyW'];
    if (jumpKeys.indexOf(e.code) > -1) {
      e.preventDefault(); // Prevent scrolling
      var el = document.querySelector("[title='" + progressTitle + "']");
      if (el == document.activeElement) el.click();
    }
    
    if (e.code == 'Escape') {
      e.preventDefault();
      exitLevelPicker();
    }
  }

  function updateItems() {
    items.value = []; // Empty array
    levels.packs.forEach(function(pack) {
      items.value.push(pack);
    });
  }

  onBeforeMount(function() {
    updateItems();
    updateSelectedPack(progress - 1);
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
      <h1>Level Packs</h1>
      <p>Select a level pack</p>
      <BubbleCarousel :items="items" :selected="selectedPack" />
    </div>
    <div class="footer">
      <a class="button center fade-in">
        <span class="material-symbols-rounded">slideshow</span>
        Select
      </a>
    </div>
  </div>
</template>