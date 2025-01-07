<script lang="ts" setup>
import { useStallDrawer, StallButton } from '@stall/common-ui';

import ExtraDrawer from './drawer.vue';

const [Drawer, drawerApi] = useStallDrawer({
  // 连接抽离的组件
  connectedComponent: ExtraDrawer,
});

function open() {
  drawerApi.open();
}

function handleUpdateTitle() {
  drawerApi.setState({ title: '外部动态标题' });
  drawerApi.open();
}
</script>

<template>
  <div>
    <Drawer />

    <StallButton @click="open">Open</StallButton>
    <StallButton class="ml-2" type="primary" @click="handleUpdateTitle">
      从外部修改标题并打开
    </StallButton>
  </div>
</template>
