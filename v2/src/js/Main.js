import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from '../vue/App.vue'
import PageHome from '../vue/PageHome.vue'
import PagePlay from '../vue/PagePlay.vue'

const routes = [
  {
    path: '/',
    component: PageHome
  },
  {
    path: '/play',
    component: PagePlay
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// Initialize app with routes
const app = createApp(App);
app.use(router);
app.mount('#app');