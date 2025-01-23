<script setup>
  import { useI18n } from 'vue-i18n';

  const i18n = useI18n({ useScope: 'global' });
  var props = defineProps(['settings']);

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
    <p>{{ i18n.t('settings.mods.title') }}</p>
    <div class="group">
      <div class="option">
        <label for="mods"><span class="material-symbols-rounded">assignment</span> {{ i18n.t('settings.mods.clipboard') }}</label>
        <textarea :value="loadMods()" id="mods" @change="saveMods" spellcheck="false"></textarea>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label><span class="material-symbols-rounded">security</span> {{ i18n.t('settings.mods.security') }}</label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label>
          <span class="material-symbols-rounded">content_copy</span> {{ i18n.t('settings.mods.security') }}
          <br>
          <br>
          {{ i18n.t('settings.mods.trusted_mods') }}: <a href="https://github.com/Charlieee1/Boxel-3d-Mods/" target="_blank">github.com/Charlieee1</a></label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label><span class="material-symbols-rounded">arrow_selector_tool</span> {{ i18n.t('settings.mods.inspect_instructions') }}</label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label><span class="material-symbols-rounded">slideshow</span> {{ i18n.t('settings.mods.paste_instructions') }}</label>
      </div>
    </div>
  </div>
</template>