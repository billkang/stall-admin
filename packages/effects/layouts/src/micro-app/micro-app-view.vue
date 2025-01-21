<script lang="ts" setup>
import type { RouteLocationNormalized } from 'vue-router';

import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { preferences } from '@stall/preferences';
import { useTabbarStore } from '@stall/stores';

import { StallSpinner } from '@stall-core/shadcn-ui';

defineOptions({ name: 'MicroAppView' });

const spinningList = ref<boolean[]>([]);
const tabbarStore = useTabbarStore();
const route = useRoute();

const enableTabbar = computed(() => preferences.tabbar.enable);

const microAppRoutes = computed(() => {
  if (!enableTabbar.value) {
    return route.meta.appUrl ? [route] : [];
  }
  return tabbarStore.getTabs.filter((tab) => !!tab.meta?.appUrl);
});

const tabNames = computed(
  () => new Set(microAppRoutes.value.map((item) => item.name as string)),
);

const showIframe = computed(() => microAppRoutes.value.length > 0);

function routeShow(tabItem: RouteLocationNormalized) {
  return tabItem.name === route.name;
}

function canRender(tabItem: RouteLocationNormalized) {
  const { meta, name } = tabItem;

  if (!name || !tabbarStore.renderRouteView) {
    return false;
  }

  if (!enableTabbar.value) {
    return routeShow(tabItem);
  }

  // 跟随 keepAlive 状态,与其他tab页保持一致
  if (
    !meta?.keepAlive &&
    tabNames.value.has(name as string) &&
    name !== route.name
  ) {
    return false;
  }
  return tabbarStore.getTabs.some((tab) => tab.name === name);
}

function hideLoading(index: number) {
  spinningList.value[index] = false;
}

function showSpinning(index: number) {
  const curSpinning = spinningList.value[index];
  // 首次加载时显示loading
  return curSpinning === undefined ? true : curSpinning;
}
</script>

<template>
  <template v-if="showIframe">
    <template v-for="(item, index) in microAppRoutes" :key="item.fullPath">
      <div
        v-if="canRender(item)"
        v-show="routeShow(item)"
        class="relative size-full"
      >
        <StallSpinner :spinning="showSpinning(index)" />
        <micro-app
          class="size-full"
          :name="item.meta.appName"
          :url="item.meta.appUrl"
          iframe
          @mounted="hideLoading(index)"
        />
      </div>
    </template>
  </template>
</template>
