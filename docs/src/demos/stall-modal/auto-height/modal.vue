<script lang="ts" setup>
import { ref } from 'vue';

import { useStallModal, StallButton } from '@stall/common-ui';

const list = ref<number[]>([]);

const [Modal, modalApi] = useStallModal({
  onCancel() {
    modalApi.close();
  },
  onConfirm() {
    console.log('onConfirm');
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      handleUpdate(10);
    }
  },
});

function handleUpdate(len: number) {
  modalApi.setState({ loading: true });
  setTimeout(() => {
    list.value = Array.from({ length: len }, (_v, k) => k + 1);
    modalApi.setState({ loading: false });
  }, 2000);
}
</script>
<template>
  <Modal title="自动计算高度">
    <div
      v-for="item in list"
      :key="item"
      class="even:bg-heavy bg-muted flex-center h-[220px] w-full"
    >
      {{ item }}
    </div>
    <template #prepend-footer>
      <StallButton type="link" @click="handleUpdate(6)">
        点击更新数据
      </StallButton>
    </template>
  </Modal>
</template>
