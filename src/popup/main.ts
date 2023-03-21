import { createApp, h } from 'vue'
import Welcome from './views/Welcome.vue';
import AddTokens from './views/AddTokens.vue'

// import router from '../router';
import { IonicVue } from '@ionic/vue';
import { createPinia } from 'pinia';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import '../theme/variables.css';
// import Vue from 'vue'
import {router} from "./router"
// import connectbackground from "../service/controller"

// Vue.use(VueRouter)

// const routes = [
//     { path: '/', component: Welcome },
//     { path : '/login', component:Login},
//     { path: '/app', component: App },
// ]

// export const router = createRouter({
//     // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
//     history: createWebHashHistory('/'),
//     routes, // short for `routes: routes`
// })

const pinia = createPinia();

const app = createApp({
  render: ()=>h(Welcome)
})
  .use(IonicVue)
  .use(pinia)
  .use(router);
  
async function startup() {
  app.mount('#app');
}

startup();
