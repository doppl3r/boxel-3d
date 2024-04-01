<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import BubbleButtonSettings from './BubbleButtonSettings.vue';
  import levels from '../json/levels.json';

  // Initialize variables
  var scores = app.storage.getScores();
  var settings = app.storage.getSettings();
  var progress = parseInt(settings.progress);
  var progressName = getLevelName(progress - 1);
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

  async function playLevel(name) {
    var response = await fetch(origin.value + pathname.value + '/json/' + name + '.json');
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
    settings.progress = getLevelIndex(name) + 1;
    app.updateSettings(settings);
    app.playLevel();
    app.resetScene();
    
    // Send event to show credits
    setTimeout(function() {
      window.dispatchEvent(new CustomEvent('setCredit', { detail: { text: credit }}));
    }, 500);
  }

  function getScore(name) {
    return scores[name];
  }

  function getLevelIndex(name) {
    var count = 0;
    var index = -1;
    
    // Loop through packs array
    levels.packs.forEach(function(pack) {
      // Loop through each levels array
      pack.levels.forEach(function(level) {
        // Set level index and increment count
        if (name == level.name) {
          index = count;
        }
        count++;
      });
    });
    return index;
  }

  function getLevelName(index) {
    var name;
    var count = 0;

    // Loop through packs array
    levels.packs.forEach(function(pack) {
      // Loop through each levels array
      pack.levels.forEach(function(level) {
        // Set name and increment count
        if (index == count) {
          name = level.name;
        }
        count++;
      });
    });
    return name;
  }

  function scrollToLevel() {
    var el = document.querySelector("[name='" + progressName + "']");

    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function exitLevelPicker() {
    emit('setPage', 'home');
  }

  function updateProgressName(e) {
    progressName = e.target.getAttribute('name');
  }

  function keydown(e) {
    var jumpKeys = ['Space', 'Enter', 'ArrowUp', 'KeyW'];
    if (jumpKeys.indexOf(e.code) > -1) {
      e.preventDefault(); // Prevent scrolling
      var el = document.querySelector("[name='" + progressName + "']");
      if (el == document.activeElement) el.click();
    }
    
    if (e.code == 'Escape') {
      e.preventDefault();
      exitLevelPicker();
    }
  }
  
  // Run function after being mounted (visible)
  onMounted(function() {
    scrollToLevel();
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
    </div>
    <div class="footer">
      <a class="button center fade-in">
        <span class="material-symbols-rounded">slideshow</span>
        Play
      </a>
    </div>
  </div>
</template>