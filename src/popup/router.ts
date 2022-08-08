import Vue from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import App from './App.vue'
import Welcome from './Welcome.vue'
import Login from './Login.vue'


const routes = [
    {path: '/', redirect: '/welcome'},
    { path: '/welcome', component: Welcome },
    { path : '/login', component:Login},
    { path: '/app', component: App },
]

export const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHistory('/'),
    routes, // short for `routes: routes`
})