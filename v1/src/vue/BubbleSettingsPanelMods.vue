<script setup>
  import { ref } from 'vue';
  import { Utility } from '../js/Utility.js';
  import { useI18n } from 'vue-i18n';
  import { mods as modData } from '../js/Data.js';

  const util = new Utility();
  const i18n = useI18n({ useScope: 'global' });
  const props = defineProps(['settings']);
  const showOldMods = ref(false);

  function loadMods() {
    var mods = localStorage.getItem('mods');
    if (mods == null || mods == '') mods = 'app.loop.speed = 2;';
    return mods;
  }

  function saveMods(e) {
    var mods = e.target.value;
    localStorage.setItem('mods', mods);
  }
</script>
<template>
  <div class="panel">
    <p @click="showOldMods = true">
      {{ i18n.t('settings.mods.title') }}
    </p>
    <div class="group">
      <div class="option wrap">
        <label class="flex gap align-items-center">
          <span class="material-symbols-rounded">link</span> <a href="https://steamcommunity.com/workshop/browse/?appid=3208440&requiredtags%5B%5D=Mod" target="_blank">
            {{ i18n.t('popup.text.browse') }}
            {{ i18n.t('home.button.steam') }}
            {{ i18n.t('home.button.workshop') }}
          </a>
        </label>
      </div>
    </div>
    <div class="group" v-if="util.isElectronApp() && modData.length > 0">
      <div class="option">
        <ul>
          <li v-for="mod in modData">
            {{ mod.title }}
          </li>
        </ul>
      </div>
    </div>
    <div class="group" v-if="showOldMods">
      <div class="option wrap">
        <label for="mods"><span class="material-symbols-rounded">assignment</span> {{ i18n.t('settings.mods.clipboard') }}</label>
        <textarea :value="loadMods()" id="mods" @change="saveMods" spellcheck="false"></textarea>
      </div>
    </div>
    <div class="group" v-if="showOldMods">
      <div class="option">
        <label>
          <span class="material-symbols-rounded">security</span> {{ i18n.t('settings.mods.security') }}
          <br>
          <br>
          {{ i18n.t('settings.mods.trusted_mods') }}: <a href="https://github.com/Charlieee1/Boxel-3d-Mods/" target="_blank">github.com/Charlieee1</a></label>
      </div>
    </div>
    <div class="group" v-if="showOldMods">
      <div class="option">
        <label><span class="material-symbols-rounded">arrow_selector_tool</span> {{ i18n.t('settings.mods.inspect_instructions') }}</label>
      </div>
    </div>
    <div class="group" v-if="showOldMods">
      <div class="option">
        <label><span class="material-symbols-rounded">slideshow</span> {{ i18n.t('settings.mods.paste_instructions') }}</label>
      </div>
    </div>
  </div>
</template>