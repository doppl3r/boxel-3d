import { createApp } from 'vue'
import App from '../vue/App.vue'
import i18n from './i18n';
import { setupTauriDesktopBridge } from '../../../src/js/tauri-desktop-bridge.js';

await setupTauriDesktopBridge();

const app = createApp(App);
app.use(i18n);
app.mount('#app');