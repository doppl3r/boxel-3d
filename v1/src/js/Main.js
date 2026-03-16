import { createApp } from 'vue'
import App from '../vue/App.vue'
import i18n from './i18n';
import { setupTauriElectronShim } from '../../../src/js/tauri-electron-shim.js';

await setupTauriElectronShim();

const app = createApp(App);
app.use(i18n);
app.mount('#app');