<template>
  <div
    class="stall-galaxy-table-filter__select"
    :class="{ 'focused-filter': focusedFilter === column.dataIndex }"
  >
    <!-- 显示列标题 -->
    <span class="option-title">{{ column.title }}</span>

    <!-- 下拉选择组件 -->
    <Select
      v-model="formData[column.dataIndex]"
      :multiple="column.filterable.multiple === true"
      :filter-option="false"
      allow-clear
      placeholder="全部"
      @click.stop="handleFocus(column.dataIndex)"
      @search="handleCustomSearch(column.dataIndex, $event)"
      @change="handleChange">
      <!-- 循环渲染选项 -->
      <Option
        v-for="item of column.filterable.filters?.map((d: any) => ({ colKey: column.dataIndex, ...d }))"
        :key="item.value"
        :value="item.value"
        :label="item.text" />
    </Select>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, onMounted } from 'vue';
import { Select, Option } from '@arco-design/web-vue';
import { useTableSetting } from './hooks/useTableSetting';
import { useTable } from './hooks/useTable';

export default defineComponent({
  components: {
    Select,
    Option,
  },
  props: {
    uuid: {
      type: String,
      required: true, // 必须传入 uuid
    },
    column: {
      type: Object as PropType<any>,
      required: true, // 必须传入列配置
    },
  },
  emits: ['custom-search', 'search'], // 定义组件触发的事件
  setup(props, { emit }) {
    // 获取表格的聚焦过滤器状态和相关方法
    const { handleClickFilter, focusedFilter, handleClearFocusedFilter } = useTable({ props, emit });

    // 获取表单数据
    const { formData } = useTableSetting(props);

    // 组件挂载时清空聚焦过滤器
    onMounted(() => {
      handleClearFocusedFilter();
    });

    // 自定义搜索事件
    const handleCustomSearch = (key: string, value: string) => {
      emit('custom-search', { key, value }); // 触发 custom-search 事件
    };

    // 值变化事件
    const handleChange = () => {
      emit('search', formData); // 触发 search 事件
    };

    // 聚焦事件
    const handleFocus = (name: string) => {
      handleClickFilter(name); // 触发聚焦过滤器事件
    };

    return {
      formData, // 表单数据
      handleCustomSearch, // 自定义搜索方法
      handleChange, // 值变化方法
      handleFocus, // 聚焦方法
      handleClickFilter, // 点击过滤器方法
      focusedFilter, // 聚焦过滤器状态
      handleClearFocusedFilter, // 清空聚焦过滤器方法
    };
  },
});
</script>
