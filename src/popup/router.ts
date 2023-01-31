import Vue from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import Wallet from './views/Wallet.vue'
import Welcome from './views/Welcome.vue'
import Login from './views/Login.vue'
import Splash from './views/Splash.vue'
import Connect from './views/Connect.vue'
import Sign from './views/Sign.vue'


const routes = [
    {path: '/', redirect: '/welcome'},
    {path: '/splash', component: Splash},
    { path: '/welcome', component: Welcome },
    { path : '/login/:task', component:Login},
    { path: '/app/:id', component: Wallet },
    { path: '/connect/:id', component: Connect },
    { path: '/sign', component: Sign }
]

export const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHistory('/'),
    routes, // short for `routes: routes`
})