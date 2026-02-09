<script lang="ts" setup>
import { StallButton, useStallDrawer } from '@stall/common-ui';

import ExtraDrawer from './drawer.vue';

const [Drawer, drawerApi] = useStallDrawer({
  // 连接抽离的组件
  connectedComponent: ExtraDrawer,
});

function open() {
  drawerApi.setData({
    content: '外部传递的数据 content',
    payload: '外部传递的数据 payload',
  });
  drawerApi.open();
}
</script>

<template>
  <div>
    <Drawer />

    <StallButton @click="open">Open</StallButton>
  </div>
</template>
