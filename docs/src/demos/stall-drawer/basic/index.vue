<script lang="ts" setup>
import { StallButton, useStallDrawer } from '@stall/common-ui';

const [Drawer, drawerApi] = useStallDrawer();
</script>
<template>
  <div>
    <StallButton @click="() => drawerApi.open()">Open</StallButton>
    <Drawer class="w-[600px]" title="基础示例"> drawer content </Drawer>
  </div>
</template>
