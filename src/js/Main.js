import { createApp } from 'vue'
import App from '../vue/App.vue'
import i18n from '../../v1/src/js/i18n';
import { setupTauriElectronShim } from './tauri-electron-shim.js';

await setupTauriElectronShim();

const app = createApp(App);
app.use(i18n);
app.mount('#app');