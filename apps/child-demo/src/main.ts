import type { App as AppInstance } from 'vue';
import type { Router, RouterHistory } from 'vue-router';

import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import App from './App.vue';
import routes from './router';

let app: AppInstance | null = null;
let router: null | Router = null;
let history: null | RouterHistory = null;

history = createWebHistory();
router = createRouter({
  history,
  routes,
});

app = createApp(App);
app.use(router);
app.mount('#vite-app');
