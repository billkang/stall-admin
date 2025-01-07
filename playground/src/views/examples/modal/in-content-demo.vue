<script lang="ts" setup>
import { useStallModal } from '@stall/common-ui';

import { message } from 'ant-design-vue';

const [Modal, modalApi] = useStallModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm() {
    message.info('onConfirm');
    // modalApi.close();
  },
});
</script>
<template>
  <Modal
    append-to-main
    class="w-[600px]"
    title="基础弹窗示例"
    title-tooltip="标题提示内容"
  >
    此弹窗指定在内容区域打开
  </Modal>
</template>
