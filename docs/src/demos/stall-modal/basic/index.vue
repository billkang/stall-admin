<script lang="ts" setup>
import { useStallModal, StallButton } from '@stall/common-ui';

const [Modal, modalApi] = useStallModal();
</script>
<template>
  <div>
    <StallButton @click="() => modalApi.open()">Open</StallButton>
    <Modal class="w-[600px]" title="基础示例"> modal content </Modal>
  </div>
</template>
