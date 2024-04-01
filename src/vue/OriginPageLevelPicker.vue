<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import levels from '../json/levels.json';

  // Initialize variables
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
        if (index == count) {
          title = level.title;
        }
        count++;
      });
    });
    return title;
  }

  function scrollToLevel() {
    var el = document.querySelector("[title='" + progressTitle + "']");

    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
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
  <div class="level-picker dashboard">
    <div class="background"></div>
    <div class="wrapper fade-in">
      <h1>Level<strong>Packs</strong></h1>
      <div class="buttons">
        <a class="button top-left" @click="exitLevelPicker" title="Exit to home (ESC)"><img src="/img/svg/home.svg"></a>
      </div>
      <div class="levels">
        <div class="list">
          <template v-for="(pack, i) of levels.packs">
            <h2>{{ pack.title }}</h2>
            <p v-if="pack.description">{{ pack.description }}</p>
            <div class="buttons" v-if="pack.links">
              <a v-for="(link) of pack.links" class="button" :class="link.class" :href="link.url" :target="link.target">
                <span>{{ link.text }}</span> <img v-if="link.icon" :src="origin + pathname + link.icon" />
              </a>
            </div>
            <template v-for="(level, j) of pack.levels">
              <div class="level" :class="{ completed: getScore(level.title) }" :title="level.title" @click="playLevel(level.title)" tabindex="0" @focus="updateProgressTitle($event)">
                <span class="score" v-if="getScore(level.title)">{{ scores[level.title] }}</span>
                <span class="title">{{ level.description }}</span>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>