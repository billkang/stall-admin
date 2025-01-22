<template>
  <div class="stall-galaxy-table-filter__mode">
    <ButtonGroup>
      <Tooltip :content="t(`table.filter.mode.table`)">
        <Button
          :class="{ active: mode === 'table' }"
          @click="handleChangeMode('table')"
        >
          <template #icon>
            <IconList />
          </template>
        </Button>
      </Tooltip>

      <Tooltip :content="t(`table.filter.mode.card`)">
        <Button
          :class="{ active: mode === 'card' }"
          @click="handleChangeMode('card')"
        >
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
import { IconApps, IconList } from '../icon';
import { ButtonGroup, Button, Tooltip, useI18n } from 'ant-design-vue';

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
    const { t } = useI18n();
    const mode = ref('table');

    const handleChangeMode = (_mode: 'table' | 'card') => {
      mode.value = _mode;
      emit('change-mode', _mode);
    };

    return {
      t,
      mode,
      handleChangeMode,
    };
  },
});
</script>
