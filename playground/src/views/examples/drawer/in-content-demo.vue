<script lang="ts" setup>
import { useStallDrawer } from '@stall/common-ui';

import { message } from 'ant-design-vue';

const [Drawer, drawerApi] = useStallDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm() {
    message.info('onConfirm');
    // drawerApi.close();
  },
});
</script>
<template>
  <Drawer append-to-main title="基础抽屉示例" title-tooltip="标题提示内容">
    <template #extra> extra </template>
    本抽屉指定在内容区域打开
  </Drawer>
</template>
