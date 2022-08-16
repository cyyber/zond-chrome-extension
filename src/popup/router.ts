import Vue from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import Wallet from './views/Wallet.vue'
import Welcome from './views/Welcome.vue'
import Login from './views/Login.vue'
import Splash from './views/Splash.vue'
import Account from './views/AccountDetails.vue'


const routes = [
    {path: '/', redirect: '/account'},
    {path: '/splash', component: Splash},
    { path: '/welcome', component: Welcome },
    { path : '/login', component:Login},
    { path: '/app/:id', component: Wallet }
]

export const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHistory('/'),
    routes, // short for `routes: routes`
})