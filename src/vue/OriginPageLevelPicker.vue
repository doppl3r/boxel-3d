<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import levels from '../json/levels.json';

  // Initialize variables
  var packGroup = ref('campaign');
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

  function setPackGroup(name) {
    packGroup.value = name;
  }

  async function playLevel(name) {
    var response = await fetch(origin.value + pathname.value + '/json/' + packGroup.value + '/' + name + '.json');
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
    
    // Loop through level groups (ex: campaign vs community)
    for (var group in levels) {
      // Loop through packs array
      levels[group].packs.forEach(function(pack) {
        // Loop through each levels array
        pack.levels.forEach(function(level) {
          // Set level index and increment count
          if (name == level.name) {
            packGroup.value = group;
            index = count;
          }
          count++;
        });
      });
    }
    return index;
  }

  function getLevelName(index) {
    var name;
    var count = 0;

    // Loop through level groups (ex: campaign vs community)
    for (var group in levels) {
      // Loop through packs array
      levels[group].packs.forEach(function(pack) {
        // Loop through each levels array
        pack.levels.forEach(function(level) {
          // Set name and increment count
          if (index == count) {
            packGroup.value = group;
            name = level.name;
          }
          count++;
        });
      });
    }
    return name;
  }

  function scrollToLevel() {
    var el = document.querySelector("[name='" + progressName + "']");

    el.focus();
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
        <a class="button" :class="{ purple: packGroup != 'campaign' }" @click="setPackGroup('campaign')" tabindex="0"><span>Campaign</span></a>
        <a class="button" :class="{ purple: packGroup != 'community' }" @click="setPackGroup('community')" tabindex="0"><span>Community</span></a>
      </div>
      <div class="levels">
        <template v-for="(group, key) of levels">
          <div class="list" v-show="packGroup == key">
            <template v-for="(pack, i) of group.packs">
              <h2>{{ pack.name }}</h2>
              <p v-if="pack.description">{{ pack.description }}</p>
              <div class="buttons" v-if="pack.links">
                <a v-for="(link) of pack.links" class="button" :class="link.class" :href="link.url" :target="link.target">
                  <span>{{ link.text }}</span> <img v-if="link.icon" :src="origin + pathname + link.icon" />
                </a>
              </div>
              <template v-for="(level, j) of pack.levels">
                <div class="level" :class="{ completed: getScore(level.name) }" :name="level.name" @click="playLevel(level.name)" tabindex="0" @focus="updateProgressName($event)">
                  <span class="score" v-if="getScore(level.name)">{{ scores[level.name] }}</span>
                  <span class="title">{{ level.description }}</span>
                </div>
              </template>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>