import type { Router } from 'vue-router';

import { preferences } from '@stall/preferences';
import { useAccessStore } from '@stall/stores';
import { startProgress, stopProgress } from '@stall/utils';

import { coreRouteNames } from '#/router/routes';

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach(async (to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行

    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to) => {
    const accessStore = useAccessStore();

    // *******************************
    // * 步骤 1：检查是否为基本路由 *
    // *******************************

    // 检查当前路由是否是核心路由
    // 基本路由，这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      /**
       * 待完善的代码
       */

      // 其他核心路由直接放行
      return true;
    }

    // *******************************
    // * 步骤 2：检查访问令牌 *
    // *******************************
    // accessToken 检查
    // 如果没有访问令牌
    if (!accessStore.accessToken) {
      /**
       * 待完善的代码
       */

      // 如果已经是登录页面，直接放行
      return to;
    }

    // *******************************
    // * 步骤 3：生成动态路由 *
    // *******************************

    /**
     * 待完善的代码
     */

    // *******************************
    // * 步骤 4：导航重定向 *
    // *******************************

    /**
     * 待完善的代码
     */
  });
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
}

export { createRouterGuard };
