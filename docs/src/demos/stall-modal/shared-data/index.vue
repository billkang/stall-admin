<script lang="ts" setup>
import { StallButton, useStallModal } from '@stall/common-ui';

import ExtraModal from './modal.vue';

const [Modal, modalApi] = useStallModal({
  // 连接抽离的组件
  connectedComponent: ExtraModal,
});

function openModal() {
  modalApi.setData({
    content: '外部传递的数据 content',
    payload: '外部传递的数据 payload',
  });
  modalApi.open();
}
</script>

<template>
  <div>
    <Modal />

    <StallButton @click="openModal">Open</StallButton>
  </div>
</template>
