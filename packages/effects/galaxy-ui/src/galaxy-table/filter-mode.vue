<template>
  <div class="stall-galaxy-table-filter__mode">
    <ButtonGroup>
      <Tooltip content="列表模式">
        <Button :class="{ active: mode === 'table' }" @click="handleChangeMode('table')">
          <template #icon>
            <IconList />
          </template>
        </Button>
      </Tooltip>

      <Tooltip content="卡片模式">
        <Button :class="{ active: mode === 'card' }" @click="handleChangeMode('card')">
          <template #icon>
            <IconApps />
          </template>
        </Button>
      </Tooltip>
    </ButtonGroup>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { IconApps, IconList } from '@arco-design/web-vue/es/icon';
import { ButtonGroup, Button, Tooltip } from '@arco-design/web-vue';

export default defineComponent({
  components: {
    IconApps,
    IconList,
    ButtonGroup,
    Button,
    Tooltip,
  },
  emits: ['change-mode'],
  setup(_props, { emit }) {
    const mode = ref('table');

    const handleChangeMode = (_mode: 'table' | 'card') => {
      mode.value = _mode;
      emit('change-mode', _mode);
    };

    return {
      mode,
      handleChangeMode,
    };
  },
});
</script>
