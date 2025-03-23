<template>
  <div
    class="stall-galaxy-table__filter"
    :class="{ disabled }"
    v-if="filterableColumns.length > 0">
    <!-- 自定义插槽：过滤器前置内容 -->
    <Space :size="8">
      <slot name="filter-before"></slot>

      <!-- 更多筛选器 -->
      <template v-if="displayMoreFilter">
        <!-- 渲染更多筛选器的下拉菜单 -->
        <FilterMoreFilterDropdown
          v-if="innerFilter.moreFilter"
          :uuid="uuid"
          :filterableColumns="filterableColumns"
          @reset="handleReset"
          @submit="handleSearch" />
      </template>

      <!-- 自定义插槽：过滤器后置内容 -->
      <slot name="filter-after"></slot>
    </Space>
  </div>

  <!-- 筛选结果摘要 -->
  <FilterSummary
    v-if="innerFilter.summary"
    :uuid="uuid"
    :columns="columns"
    @search="handleSearch" />
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import { Space } from '@arco-design/web-vue';
import { type FormData, useTableSetting } from './hooks/useTableSetting';
import FilterMoreFilterDropdown from './filter-more-filter-dropdown.vue';
import FilterSummary from './filter-summary.vue';

export default defineComponent({
  components: {
    Space,
    FilterMoreFilterDropdown,
    FilterSummary,
  },
  props: {
    uuid: {
      type: String,
      required: true, // 必须传入 uuid
    },
    disabled: {
      type: Boolean,
      default: false, // 默认不禁用
    },
    columns: {
      type: Array as PropType<any[]>,
      required: true, // 必须传入列配置
    },
    filter: {
      type: Object as PropType<{
        selector: boolean;
        moreFilter: boolean;
        inputSearch: boolean;
        summary: boolean;
      }>,
      default: () => ({
        selector: true, // 默认显示选择器
        moreFilter: true, // 默认显示更多筛选
        inputSearch: true, // 默认显示输入搜索
        summary: true, // 默认显示筛选结果摘要
      }),
    },
  },
  emits: ['custom-search', 'search'], // 定义组件触发的事件
  setup(props, { emit }) {
    // 获取可筛选的列和输入搜索的列
    const { filterableColumns } = useTableSetting(props);

    // 计算属性：选择器列
    const selectorColumns = computed(() => {
      return filterableColumns.value
        .filter((col: any) => col.filterable?.componentType === 'select' || col.filterable?.filters)
        .slice(0, 2); // 最多显示两个选择器
    });

    // 计算属性：内部筛选器配置
    const innerFilter = computed(() => {
      const { selector = true, moreFilter = true, inputSearch = true, summary = true } = props.filter;

      return {
        selector,
        moreFilter,
        inputSearch,
        summary,
      };
    });

    // 计算属性：是否显示更多筛选器
    const displayMoreFilter = computed(() => {
      return (
        filterableColumns.value.filter(
          (col: any) => col.filterable?.componentType !== 'input' || col.filterable?.filters,
        ).length > 0
      );
    });

    // 处理搜索事件
    const handleSearch = (data: FormData) => {
      emit('search', data); // 触发 search 事件
    };

    // 处理重置事件
    const handleReset = () => {
      emit('search', null); // 触发 search 事件，传入 null 表示重置
    };

    return {
      innerFilter, // 内部筛选器配置
      selectorColumns, // 选择器列
      displayMoreFilter, // 是否显示更多筛选器
      filterableColumns, // 可筛选的列
      handleReset, // 处理重置事件
      handleSearch, // 处理搜索事件
    };
  },
});
</script>
