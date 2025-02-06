import { createI18n } from 'vue-i18n';
import en from '../json/i18n/en.json';
import es from '../json/i18n/es.json';
import fa from '../json/i18n/fa.json';
import ko from '../json/i18n/ko.json';

const settings = JSON.parse(localStorage.getItem('settings') || '{}');
const i18n = createI18n({
  legacy: false,
  locale: settings.language || 'en',
  fallbackLocale: 'en',
  messages: {
    en: en,
    es: es,
    fa: fa,
    ko: ko
  }
});

export default i18n;