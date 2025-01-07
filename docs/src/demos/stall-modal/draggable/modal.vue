<script lang="ts" setup>
import { useStallModal } from '@stall/common-ui';

const [Modal] = useStallModal({
  draggable: true,
});
</script>
<template>
  <Modal title="拖拽示例"> modal content </Modal>
</template>
