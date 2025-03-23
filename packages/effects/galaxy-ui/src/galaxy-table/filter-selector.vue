<template>
  <div class="stall-galaxy-table-filter__select" :class="{ 'focused-filter': focusedFilter === column.dataIndex }">
    <span class="option-title">{{ column.title }}</span>
    <Select
      v-model="formData[column.dataIndex]"
      :multiple="column.filterable.multiple === true"
      :filter-option="false"
      allow-clear
      placeholder="全部"
      @click.stop="handleFocus(column.dataIndex)"
      @search="handleCustomSearch(column.dataIndex, $event)"
      @change="handleChange">
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
      required: true,
    },
    column: {
      type: Object as PropType<any>,
      required: true,
    },
  },
  emits: ['custom-search', 'search'],
  setup(props, { emit }) {
    const { handleClickFilter, focusedFilter, handleClearFocusedFilter } = useTable({ props, emit });

    const { formData } = useTableSetting(props);

    onMounted(() => {
      handleClearFocusedFilter();
    });

    const handleCustomSearch = (key: string, value: string) => {
      emit('custom-search', { key, value });
    };

    const handleChange = () => {
      emit('search', formData);
    };

    const handleFocus = (name: string) => {
      handleClickFilter(name);
    };

    return {
      formData,
      handleCustomSearch,
      handleChange,
      handleFocus,
      handleClickFilter,
      focusedFilter,
      handleClearFocusedFilter,
    };
  },
});
</script>
