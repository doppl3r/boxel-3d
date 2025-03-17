<script setup>
  import { ref  } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { mods as modData } from '../js/Data.js';

  const i18n = useI18n({ useScope: 'global' });
  const props = defineProps(['settings']);
  const isElectronApp = ref(window.electron != undefined);
</script>
<template>
  <div class="panel">
    <p>{{ i18n.t('settings.mods.title') }}</p>
    <div class="group">
      <div class="option wrap">
        <label>
          <span class="material-symbols-rounded">link</span> <a href="https://steamcommunity.com/workshop/browse/?appid=3208440&requiredtags%5B%5D=Mod" target="_blank">
            {{ i18n.t('popup.text.browse') }}
            {{ i18n.t('home.button.steam') }}
            {{ i18n.t('home.button.workshop') }}
          </a>
        </label>
      </div>
    </div>
    <div class="group" v-if="isElectronApp && modData.length > 0">
      <div class="option">
        <ul>
          <li v-for="mod in modData">
            {{ mod.title }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>