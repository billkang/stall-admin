<script lang="ts" setup>
import { useStallModal, StallButton } from '@stall/common-ui';

import ExtraModal from './modal.vue';

const [Modal, modalApi] = useStallModal({
  // 连接抽离的组件
  connectedComponent: ExtraModal,
});

function openModal() {
  modalApi.open();
}

function handleUpdateTitle() {
  modalApi.setState({ title: '外部动态标题' });
  modalApi.open();
}
</script>

<template>
  <div>
    <Modal />

    <StallButton @click="openModal">Open</StallButton>
    <StallButton class="ml-2" type="primary" @click="handleUpdateTitle">
      从外部修改标题并打开
    </StallButton>
  </div>
</template>
