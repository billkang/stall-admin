<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';

import { Dropdown } from '@arco-design/web-vue';
import { IconDelete, IconDown, IconUp } from '@arco-design/web-vue/es/icon';

import { useTable } from './hooks/useTable';
import { useTableSetting } from './hooks/useTableSetting';

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
    const { getCustomFilter, deleteCustomFilter, resetFormData } =
      useTableSetting(props);
    const { handleClickFilter, focusedFilter, handleClearFocusedFilter } =
      useTable({ props, emit });
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

<template>
  <Dropdown position="bottom" trigger="click" @click.stop="handleToggle">
    <div
      class="stall-galaxy-table-filter__my-filter-overlay flex"
      :class="{ 'focused-filter': focusedFilter === 'myFilter' }"
    >
      <span>我的筛选</span>
      <IconUp v-if="isOpenOverlay" />
      <IconDown v-else />
    </div>

    <template #content>
      <div class="stall-galaxy-table-filter__my-filter">
        <div v-if="customFilters.size === 0" class="empty">
          暂无自定义的筛选项
        </div>
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
