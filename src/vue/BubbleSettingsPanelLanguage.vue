<script setup>
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  const i18n = useI18n({ useScope: 'global' });
  const props = defineProps(['settings']);
  const emit = defineEmits(['updateSettings']);
  var languages = computed(() => {
    const langArr = i18n.availableLocales.map(locale => [locale, i18n.t(`locales.${locale}`)]);
    const langObj = Object.fromEntries(langArr);
    return langObj
  });
  
  function updateLanguage(e) {
    // Dynamically update i18n locale
    i18n.locale.value = e.target.value;

    // Update settings
    emit('updateSettings', e);
  }
</script>
<template>
  <div class="panel">
    <p>{{ i18n.t('settings.language.title') }}</p>
    <div class="group">
      <div class="option">
        <label>{{ i18n.t('settings.language.select_language') }}</label>
      </div>
      <div class="option">
        <select id="language" :value="settings.language" @change="updateLanguage($event)">
          <option v-for="(value, key) of languages" :value="key" :key="key" :selected="settings.language == key">{{ value }}</option>
        </select>
      </div>
    </div>
    <div class="group">
      <div class="option">
        <label>{{ i18n.t('settings.language.credit') }}</label>
      </div>
      <div class="option">
        <ul>
          <li>outerbound (Spanish)</li>
          <li>Zeta (Persian/Farsi)</li>
          <li>R - G - C™ (French)</li>
          <li>SangSang2 (Korean)</li>
          <li>Ash (Hindi)</li>
        </ul>
      </div>
    </div>
  </div>
</template>