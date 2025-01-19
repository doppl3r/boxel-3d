import { createI18n } from 'vue-i18n';
import en from '../json/i18n/en.json';
import es from '../json/i18n/es.json';

const settings = JSON.parse(localStorage.getItem('settings') || '{}');
const i18n = createI18n({
  legacy: false,
  locale: settings.language || 'en',
  fallbackLocale: 'en',
  messages: {
    en: en,
    es: es
  }
});

export default i18n;