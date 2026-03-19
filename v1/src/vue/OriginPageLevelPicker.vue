<script setup>
  import { onMounted, onUnmounted } from 'vue';
  import { Utility } from '../js/Utility.js';
  import { levels } from '../js/Data.js';

  // Initialize variables
  var scores = app.storage.getScores();
  var settings = app.storage.getSettings();
  var progress = parseInt(settings.progress);
  var progressTitle = getLevelTitle(progress - 1);
  var emit = defineEmits(['setPage']);
  const util = new Utility();

  function openPackLink(url) {
    util.openLink(url, '_blank');
  }

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('keydown', keydown);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('keydown', keydown);
  }

  async function playSelectedLevel(level) {
    await app.playLevel({ ...level });
    emit('setPage', 'campaign');

    // Update progress
    settings.progress = app.level.getLevelIndex(level.title) + 1;
    app.updateSettings(settings);
  }

  function getScore(key) {
    return scores[key];
  }

  function getLevelTitle(index) {
    var title;
    var count = 0;
    var last = {};

    // Loop through packs array
    levels.packs.forEach(function(pack) {
      // Loop through each levels array
      pack.levels.forEach(function(level) {
        // Store temp reference to last level
        last = level;

        // Set title and increment count
        if (index == count) {
          title = level.title;
        }
        count++;
      });
    });

    // Limit progress to max level count
    if (title == undefined) {
      title = last.title;
    }

    // Return title
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
    
    if (e.code == 'Escape' || e.code == 'KeyE') {
      e.preventDefault();
      exitLevelPicker();
    }
  }
  
  // Run function after being mounted (visible)
  onMounted(function() {
    scrollToLevel();
    addEventListeners();

    // Dispatch ready event to listeners
    window.dispatchEvent(new CustomEvent('pageMounted', { detail: 'level-picker' }));
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="level-picker dashboard">
    <div class="background-cubes"></div>
    <div class="wrapper fade-in">
      <h1>Level<strong>Packs</strong></h1>
      <div class="buttons">
        <a class="button top-left" @click="exitLevelPicker" title="Exit to home (ESC)"><img :src="'../svg/home.svg'"></a>
      </div>
      <div class="levels">
        <div class="list">
          <template v-for="(pack, i) of levels.packs">
            <h2>{{ pack.title }}</h2>
            <p v-if="pack.description">{{ pack.description }}</p>
            <div class="buttons" v-if="pack.links">
              <a v-for="(link) of pack.links" class="button" :class="link.class" :href="link.url" :target="link.target" @click.prevent="openPackLink(link.url)">
                <span>{{ link.text }}</span> <img v-if="link.icon" :src="'./' + link.icon" />
              </a>
            </div>
            <template v-for="(level, j) of pack.levels">
              <div class="level" :class="{ completed: getScore(level.publishedFileId || level.title) }" :title="level.title" @click="playSelectedLevel(level)" tabindex="0" @focus="updateProgressTitle($event)">
                <span class="index" v-if="level.label">{{ level.label }}</span>
                <span class="score" v-if="getScore(level.publishedFileId || level.title)">{{ getScore(level.publishedFileId || level.title) }}</span>
                <span class="title">{{ level.description }}</span>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>