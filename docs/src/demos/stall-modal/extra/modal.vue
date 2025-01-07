<script lang="ts" setup>
import { useStallModal } from '@stall/common-ui';

const [Modal] = useStallModal();
</script>
<template>
  <Modal title="组件抽离示例"> extra modal content </Modal>
</template>
