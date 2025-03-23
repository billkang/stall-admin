<template>
  <div
    class="stall-galaxy-table__filter"
    :class="{ disabled }"
    v-if="filterableColumns.length > 0 || inputSearchColumns.length > 0">
    <Space :size="8">
      <slot name="filter-before"></slot>

      <template v-if="multiMode">
        <FilterMode @change-mode="handleChangeMode" />
      </template>

      <template v-if="innerFilter.selector">
        <span v-for="column in selectorColumns" :key="column.dataIndex">
          <FilterSelector :uuid="uuid" :column="column" @custom-search="handleCustomSearch" @search="handleSearch" />
        </span>
      </template>

      <template v-if="displayMoreFilter">
        <FilterMoreFilterDropdown
          v-if="innerFilter.moreFilter"
          :uuid="uuid"
          :filterableColumns="filterableColumns"
          @custom-search="handleCustomSearch"
          @reset="handleReset"
          @submit="handleSearch" />

        <FilterMyFilterDropdown v-if="innerFilter.myFilter" :uuid="uuid" @search="handleSearch" />
      </template>

      <FilterInputSearch
        v-if="innerFilter.inputSearch && inputSearchColumns.length > 0"
        :uuid="uuid"
        :expand="selectorColumns.length === 0"
        :column="inputSearchColumns[0]"
        @search="handleSearch" />

      <slot name="filter-after"></slot>
    </Space>
  </div>

  <FilterSummary v-if="innerFilter.summary" :uuid="uuid" :columns="columns" @search="handleSearch" />
</template>

<script lang="ts">
import type { TableColumnData } from '@arco-design/web-vue';
import { computed, defineComponent, type PropType } from 'vue';
import { type FormData, useTableSetting } from './hooks/useTableSetting';
import { Space } from '@arco-design/web-vue';
import FilterMode from './filter-mode.vue';
import FilterSelector from './filter-selector.vue';
import FilterMoreFilterDropdown from './filter-more-filter-dropdown.vue';
import FilterMyFilterDropdown from './filter-my-filter-dropdown.vue';
import FilterInputSearch from './filter-input-search.vue';
import FilterSummary from './filter-summary.vue';

export default defineComponent({
  components: {
    Space,
    FilterMode,
    FilterSelector,
    FilterMoreFilterDropdown,
    FilterMyFilterDropdown,
    FilterInputSearch,
    FilterSummary,
  },
  props: {
    uuid: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    columns: {
      type: Array as PropType<any[]>,
      required: true,
    },
    /**
     * @zh 实现对搜索栏的控制
     * @version 0.0.100
     */
    filter: {
      type: Object as PropType<{
        selector: boolean;
        moreFilter: boolean;
        myFilter: boolean;
        inputSearch: boolean;
        summary: boolean;
      }>,
      default: () => ({
        selector: true,
        moreFilter: true,
        myFilter: true,
        inputSearch: true,
        summary: true,
      }),
    },
    /**
     * @zh 多模式 支持 table/card 模式
     * @version 0.0.118
     *
     */
    multiMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['custom-search', 'search', 'change-mode'],
  setup(props, { emit }) {
    const { filterableColumns, inputSearchColumns } = useTableSetting(props);

    const selectorColumns = computed(() => {
      return filterableColumns.value
        .filter((col: TableColumnData) => col.filterable?.componentType === 'select' || col.filterable?.filters)
        .slice(0, 2);
    });

    const innerFilter = computed(() => {
      const { selector = true, moreFilter = true, myFilter = true, inputSearch = true, summary = true } = props.filter;

      return {
        selector,
        moreFilter,
        myFilter,
        inputSearch,
        summary,
      };
    });

    const displayMoreFilter = computed(() => {
      return (
        filterableColumns.value.filter(
          (col: TableColumnData) => col.filterable?.componentType !== 'input' || col.filterable?.filters,
        ).length > 0 || inputSearchColumns.value.length > 1
      );
    });

    const handleChangeMode = (mode: 'table' | 'card') => {
      emit('change-mode', mode);
    };

    const handleSearch = (data: FormData) => {
      emit('search', data);
    };

    const handleReset = () => {
      emit('search', null);
    };

    const handleCustomSearch = (data: Record<string, any>) => {
      emit('custom-search', data);
    };

    return {
      innerFilter,
      selectorColumns,
      displayMoreFilter,
      filterableColumns,
      inputSearchColumns,
      handleChangeMode,
      handleCustomSearch,
      handleReset,
      handleSearch,
    };
  },
});
</script>
