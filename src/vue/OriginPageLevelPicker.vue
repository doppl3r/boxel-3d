<script setup>
  import { ref, onMounted } from 'vue';
  import levels from '../json/levels.json';

  // Initialize variables
  var pack_group = ref('campaign');
  var scores = app.storage.getScores();
  var settings = app.storage.getSettings();
  var progress = parseInt(settings.progress);

  function setPackGroup(name) {
    pack_group.value = name;
  }

  function playLevel(name) {
    console.log(name);
    //app.ui.loadLevel($(this));
    //app.ui.updateUI('play');
    //app.resetScene(app);
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
          if (name == level.name) index = count;
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
          if (index == count) name = level.name;
          count++;
        });
      });
    }
    return name;
  }

  
  // Run function after being mounted (visible)
  onMounted(function() {
    // TODO: Scroll to settings.progress level
    console.log(getLevelName(progress));
  });
</script>

<template>
  <div class="level-picker dashboard">
    <div class="background"></div>
    <div class="wrapper fade-in">
      <h1>Level<strong>Packs</strong></h1>
      <div class="buttons">
        <a class="button top-left" @click="$emit('setPage', 'home')" title="Exit to home (ESC)"><img src="/img/svg/home.svg"></a>
        <a class="button" :class="{ purple: pack_group != 'campaign' }" @click="setPackGroup('campaign')">Campaign</a>
        <a class="button" :class="{ purple: pack_group != 'community' }" @click="setPackGroup('community')">Community</a>
      </div>
      <div class="levels">
        <template v-for="(group, key) of levels">
          <div class="list" v-show="pack_group == key">
            <template v-for="(pack, i) of group.packs">
              <h2>{{ pack.name }}</h2>
              <p v-if="pack.description">{{ pack.description }}</p>
              <div class="buttons" v-if="pack.links">
                <a v-for="(link) of pack.links" class="button" :class="link.class" :href="link.url" :target="link.target">
                  {{ link.text }} <img v-if="link.icon" :src="link.icon" />
                </a>
              </div>
              <template v-for="(level, j) of pack.levels">
                <div class="level" :class="{ completed: getScore(level.name) }" :name="level.name" @click="playLevel(level.name)">
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