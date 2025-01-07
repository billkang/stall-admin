<script lang="ts" setup>
import { useStallDrawer } from '@stall/common-ui';

const [Drawer] = useStallDrawer();
</script>
<template>
  <Drawer title="组件抽离示例"> extra drawer content </Drawer>
</template>
