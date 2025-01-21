import type { App as AppInstance } from 'vue';
import type { Router, RouterHistory } from 'vue-router';

import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import App from './App.vue';
import routes from './router';

declare global {
  interface Window {
    eventCenterForAppNameVite: any;
    __MICRO_APP_NAME__: string;
    __MICRO_APP_ENVIRONMENT__: string;
    __MICRO_APP_BASE_APPLICATION__: string;
  }
}

// 与基座进行数据交互
function handleMicroData(router: Router) {
  // eventCenterForAppNameVite 是基座添加到window的数据通信对象
  if (window.eventCenterForAppNameVite) {
    // 监听基座下发的数据变化
    window.eventCenterForAppNameVite.addDataListener(
      (data: Record<string, unknown>) => {
        if (data.path && typeof data.path === 'string') {
          data.path = data.path.replace(/^#/, '');
          // 当基座下发path时进行跳转
          if (data.path && data.path !== router.currentRoute.value.path) {
            router.push(data.path as string);
          }
        }
      },
    );

    // 向基座发送数据
    setTimeout(() => {
      window.eventCenterForAppNameVite.dispatch({ myname: 'child-vite' });
    }, 3000);
  }
}

let app: AppInstance | null = null;
let router: null | Router = null;
let history: null | RouterHistory = null;
// 将渲染操作放入 mount 函数
function mount() {
  history = createWebHistory();
  router = createRouter({
    history,
    routes,
  });

  app = createApp(App);
  app.use(router);
  app.mount('#vite-app');

  handleMicroData(router);
}

// 将卸载操作放入 unmount 函数
function unmount() {
  app?.unmount();
  history?.destroy();
  // 卸载所有数据监听函数
  window.eventCenterForAppNameVite?.clearDataListener();
  app = null;
  router = null;
  history = null;
}

// 微前端环境下，注册mount和unmount方法
if (window.__MICRO_APP_BASE_APPLICATION__) {
  // @ts-ignore
  window['micro-app-appname-vite'] = { mount, unmount };
} else {
  // 非微前端环境直接渲染
  mount();
}
