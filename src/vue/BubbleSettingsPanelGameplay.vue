<script setup>
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
    <p>Gameplay settings</p>
    <div class="group">
      <div class="option">
        <input type="checkbox" id="motion" :checked="settings.motion == true" @change="$emit('updateSettings', $event)">
        <label for="motion">Camera Motion</label>
      </div>
    </div>
    <p>Mods</p>
    <div class="group">
      <div class="option">
        <label for="mods"><span class="material-symbols-rounded">assignment</span> Clipboard</label>
        <textarea :value="loadMods()" id="mods" @change="saveMods" spellcheck="false"></textarea>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label><span class="material-symbols-rounded">security</span> For your security, mods must be manually loaded each time the game is launched.</label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label><span class="material-symbols-rounded">content_copy</span> Copy mods from trusted websites and paste them in the clipboard for later.<br><br>Trusted mods: <a href="https://github.com/Charlieee1/Boxel-3d-Mods/" target="_blank">github.com/Charlieee1</a></label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label><span class="material-symbols-rounded">arrow_selector_tool</span> Right-click this game and select <em>Inspect</em>.</label>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label><span class="material-symbols-rounded">slideshow</span> Select the <em>Console</em> tab, paste mods from the clipboard, then press the <em>enter</em> key to load mods.</label>
      </div>
    </div>
  </div>
</template>