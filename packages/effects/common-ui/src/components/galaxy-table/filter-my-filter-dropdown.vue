<template>
  <Dropdown position="bottom" trigger="click" @click.stop="handleToggle">
    <div
      class="flex stall-galaxy-table-filter__my-filter-overlay"
      :class="{ 'focused-filter': focusedFilter === 'myFilter' }">
      <span>{{ t(`table.filter.myConditions`) }}</span>
      <IconUp v-if="isOpenOverlay" />
      <IconDown v-else />
    </div>

    <template #content>
      <div class="stall-galaxy-table-filter__my-filter">
        <div v-if="customFilters.size === 0" class="empty">{{ t(`table.filter.noCustomFilterText`) }}</div>
        <ul v-else class="custom-filter-wrapper">
          <li class="item" v-for="key in customFilters.keys()" :key="key">
            <label @click="handleClickCustomFilter(key)">{{ key }}</label>
            <IconDelete @click="deleteCustomFilter(key)" />
          </li>
        </ul>
      </div>
    </template>
  </Dropdown>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import Dropdown from '../dropdown';
import IconUp from '../icon/icon-up';
import IconDown from '../icon/icon-down';
import IconDelete from '../icon/icon-delete';
import { useI18n } from '../locale';
import { useTableSetting } from './hooks/useTableSetting';
import { useTable } from './hooks/useTable';

export default defineComponent({
  components: {
    Dropdown,
    IconUp,
    IconDown,
    IconDelete,
  },
  props: {
    uuid: {
      type: String,
      required: true,
    },
  },
  emits: ['search'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { getCustomFilter, deleteCustomFilter, resetFormData } = useTableSetting(props);
    const { handleClickFilter, focusedFilter, handleClearFocusedFilter } = useTable({ props, emit, t });
    onMounted(() => {
      handleClearFocusedFilter();
    });
    // 控制【更多筛选】菜单是否可见
    const isOpenOverlay = ref(false);
    const handleToggle = () => {
      handleClickFilter('myFilter');
      isOpenOverlay.value = !isOpenOverlay.value;
    };

    const customFilters = getCustomFilter();

    const handleClickCustomFilter = (key: string) => {
      const formData = customFilters.get(key);
      if (formData) {
        resetFormData(formData);

        emit('search', formData);
      }
    };

    return {
      t,
      isOpenOverlay,
      customFilters,
      focusedFilter,
      deleteCustomFilter,
      handleToggle,
      handleClickCustomFilter,
      handleClearFocusedFilter,
      handleClickFilter,
    };
  },
});
</script>
