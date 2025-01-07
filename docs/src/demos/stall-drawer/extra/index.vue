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
</script>

<template>
  <div>
    <Drawer />
    <StallButton @click="open">Open</StallButton>
  </div>
</template>
