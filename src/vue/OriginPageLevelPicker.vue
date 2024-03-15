<script setup>
  import { ref, onMounted } from 'vue';
  import levels from '../json/levels.json';

  // TODO: Import all levels here

  // Initialize variables
  var pack_group = ref('campaign');

  function setPackGroup(name) {
    pack_group.value = name;
  }

  function playLevel(name) {
    console.log(name);
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    app.ui.appendCampaignLevels();
    app.ui.updateCampaignScores();
  })
</script>

<template>
  <div class="level-picker dashboard">
    <div class="background"></div>
    <div class="wrapper fade-in">
      <h1>Level<strong>Packs</strong></h1>
      <div class="buttons">
        <a class="button top-left" @click="$emit('setPage', 'home')" title="Exit to home (ESC)"><img src="/img/svg/home.svg"></a>
        <a class="button" :class="{ purple: pack_group != 'campaign' }" action="show-campaign" @click="setPackGroup('campaign')">Campaign</a>
        <a class="button" :class="{ purple: pack_group != 'community' }" action="show-community" @click="setPackGroup('community')">Community</a>
      </div>
      <div class="levels">
        <div class="list levels-campaign" v-if="pack_group == 'campaign'">
          <template v-for="(pack, i) of levels.campaign.packs">
            <h2>{{ pack.name }}</h2>
            <template  v-for="(level, j) of pack.levels">
              <div class="level" :name="level.name" @click="playLevel(level.name)">
                <span class="score"></span>
                <span class="title">{{ level.description }}</span>
              </div>
            </template>
          </template>
        </div>
        <div class="list levels-campaign" for="campaign" style="display: none;">
          <h2>Easy Peasy</h2>
          <div file="campaign/Campaign Level 1.json"></div>
          <div file="campaign/Campaign Level 2.json"></div>
          <div file="campaign/Campaign Level 3.json"></div>
          <div file="campaign/Campaign Level 4.json"></div>
          <div file="campaign/Campaign Level 5.json"></div>
          <h2>Lemon Difficult</h2>
          <div file="campaign/Campaign Level 6.json"></div>
          <div file="campaign/Campaign Level 7.json"></div>
          <div file="campaign/Campaign Level 8.json"></div>
          <div file="campaign/Campaign Level 9.json"></div>
          <div file="campaign/Campaign Level 10.json"></div>
          <h2>Zack's Level Pack</h2>
          <div file="campaign/Campaign Level 11.json"></div>
          <div file="campaign/Campaign Level 12.json"></div>
          <div file="campaign/Campaign Level 13.json"></div>
          <div file="campaign/Campaign Level 14.json"></div>
          <div file="campaign/Campaign Level 15.json"></div>
          <h2>Kargoh's Level Pack</h2>
          <div file="campaign/Campaign Level 16.json"></div>
          <div file="campaign/Campaign Level 17.json"></div>
          <div file="campaign/Campaign Level 18.json"></div>
          <div file="campaign/Campaign Level 19.json"></div>
          <div file="campaign/Campaign Level 20.json"></div>
          <h2>Gravity Hell</h2>
          <div file="campaign/Campaign Level 21.json"></div>
          <div file="campaign/Campaign Level 22.json"></div>
          <div file="campaign/Campaign Level 23.json"></div>
          <div file="campaign/Campaign Level 24.json"></div>
          <div file="campaign/Campaign Level 25.json"></div>
          <h2>Boxel Classics</h2>
          <div file="campaign/Campaign Level 26.json"></div>
          <div file="campaign/Campaign Level 27.json"></div>
          <div file="campaign/Campaign Level 28.json"></div>
          <div file="campaign/Campaign Level 29.json"></div>
          <div file="campaign/Campaign Level 30.json"></div>
          <h2>Spider Cube</h2>
          <div file="campaign/Campaign Level 31.json"></div>
          <div file="campaign/Campaign Level 32.json"></div>
          <div file="campaign/Campaign Level 33.json"></div>
          <div file="campaign/Campaign Level 34.json"></div>
          <div file="campaign/Campaign Level 35.json"></div>
          <h2>Alpha Testing Levels</h2>
          <p>Test out levels before they are officially released</p>
          <div file="campaign/Campaign Level 36.json"></div>
          <div file="campaign/Campaign Level 37.json"></div>
        </div>
        <div class="list levels-community" for="community" style="display: none;">
          <h2>Community Levels</h2>
          <p>Levels are made by the Boxel Community and are picked by the developer.</p>
          <div class="buttons">
            <a class="button discord" href="https://discord.gg/j8fvd4UvbE" target="_blank">Join the Discord <img src="/img/svg/discord.svg" /></a>
          </div>
          <div file="community/Junsie.json"></div>
          <div file="community/Junsie 2.json"></div>
          <div file="community/Metal Machine.json"></div>
          <div file="community/0123xrulez.json"></div>
          <div file="community/Jack TVYT.json"></div>
          <div file="community/16BitPlayer.json"></div>
          <div file="community/uncoho3.json"></div>
          <div file="community/Metal Machine 2.json"></div>
          <div file="community/Vyom.json"></div>
          <div file="community/0123xrulez 2.json"></div>
          <div file="community/16BitPlayer 2.json"></div>
          <div file="community/0123xrulez 3.json"></div>
          <div file="community/Zozo.json"></div>
          <div file="community/Junsie 3.json"></div>
          <div file="community/! __kf.json"></div>
          <div file="community/ice_dodo.json"></div>
        </div>
      </div>
    </div>
  </div>
</template>