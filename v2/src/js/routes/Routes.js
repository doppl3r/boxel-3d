import PageHome from '../../vue/PageHome.vue'
import PagePlay from '../../vue/PagePlay.vue'
import PageLevelEditor from '../../vue/PageLevelEditor.vue'

/*
  Vue Router is used to change page components using URL paths. This solution 
  reduces the need for multiple v-if conditions in the App.vue file.

  Usage: See Main.js file
*/

export default [
  {
    name: 'home',
    path: '/',
    component: PageHome
  },
  {
    name: 'play',
    path: '/play',
    component: PagePlay
  },
  {
    name: 'level-editor',
    path: '/level-editor',
    component: PageLevelEditor
  }
];