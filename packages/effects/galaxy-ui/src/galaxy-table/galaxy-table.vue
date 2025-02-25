<template>
  <div class="stall-galaxy-table-container">
    <header>
      <div class="table-header__left-section">
        <Filter
          :disabled="loading"
          :uuid="uuid"
          :columns="columns"
          :filter="filter"
          @custom-search="handleCustomSearch"
          @search="handleSearch">
          <template #filter-before>
            <slot name="filter-before"></slot>
          </template>
          <template #filter-after>
            <slot name="filter-after"></slot>
          </template>
        </Filter>
      </div>
      <div class="table-header__right-section">
        <Space :size="8">
          <slot name="header-btns-before"></slot>

          <Button
            :disabled="loading || selectedRowKeys.length < 1"
            @click="handleDeleteBatch">
            删除
          </Button>

          <slot name="header-btns-after"></slot>
        </Space>
      </div>
    </header>

    <main>
      <Setting v-model="openSetting" :uuid="uuid" :columns="columns" />

      <Table
        v-bind="$props"
        :row-key="rowKey"
        :row-selection="showRowSelection ? { selectedRowKeys, showCheckedAll } : undefined"
        :loading="loading"
        :size="tableSize"
        :columns="sortedColumns.filter((c: any) => c.visible)"
        :data="dataSource"
        :pagination="innerPagination"
        @change="handleChange"
        @sorter-change="handleSorterChange"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange">
        <template #card-item="{ record, index }">
          <slot name="card-item" :record="record" :index="index"></slot>
        </template>
        <template #columns>
          <slot name="columns"></slot>
        </template>
        <template #optional-title="{ column }">
          <div class="header-cell-action">
            {{ column.title }}

            <IconSettings class="table__setting" @click="handleOpenSetting" />
          </div>
        </template>
        <template #optional="{ record }">
          <Space>
            <slot name="table-action-before" :record="record"></slot>
            <Button
              type="text"
              @click="handleEdit(record)">
              编辑
            </Button>
            <Button
              type="text"
              @click="handleDelete(record)">
              删除
            </Button>
            <slot name="table-action-after" :record="record"></slot>
          </Space>
        </template>
      </Table>
    </main>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { TableData, TableChangeExtra, PaginationProps } from '@arco-design/web-vue';
import { defineComponent, onBeforeUnmount } from 'vue';
import { Space, Button, Table } from '@arco-design/web-vue';
import { IconSettings } from '@arco-design/web-vue/es/icon';
import { useTable } from './hooks/useTable';
import { useTableSetting } from './hooks/useTableSetting';
import Filter from './filter.vue';
import Setting from './setting.vue';

export default defineComponent({
  name: 'GalaxyTable',
  components: {
    Space,
    Button,
    Table,
    IconSettings,
    Filter,
    Setting,
  },
  props: {
    uuid: {
      type: String,
      required: true,
    },
    rowKey: {
      type: String,
      default: 'id',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    columns: {
      type: Array as PropType<any[]>,
      required: true,
    },
    dataSource: {
      type: Array as PropType<TableData[]>,
      required: true,
    },
    /**
     * @zh 分页查询
     */
    pagination: {
      type: [Boolean, Object] as PropType<boolean | PaginationProps>,
      default: () => ({
        total: 0,
        showTotal: true,
      }),
    },
    showCheckedAll: {
      type: Boolean,
      default: true,
    },
    showRowSelection: {
      type: Boolean,
      default: true,
    },
    // 实现对操作栏的控制
    optional: {
      type: Object as PropType<{ visible: boolean; width: number }>,
      default: () => ({
        visible: true,
        width: 120,
      }),
    },
    /**
     * 实现对搜索栏的控制
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
  },
  emits: ['search', 'change', 'edit', 'delete', 'delete-batch', 'delete-cancel'],
  expose: ['formData', 'innerPagination', 'selectedRowKeys'],
  setup(props, { emit }) {
    const {
      openSetting,
      selectedRowKeys,
      pagination: innerPagination,
      handleOpenSetting,
      handleSearch,
      handleSelect,
      handleSelectAll,
      handleSelectionChange,
      handleEdit,
      handleDeleteBatch,
      handleDelete,
      handleSorterChange,
      handlePageChange,
      handlePageSizeChange,
    } = useTable({ props, emit });
    const { formData, sortedColumns, tableSize, dispose, handleCustomSearch } = useTableSetting(props);

    onBeforeUnmount(() => dispose());

    function handleChange(data: TableData[], extra: TableChangeExtra, currentData: TableData[]) {
      emit('change', data, extra, currentData);
    }

    return {
      formData,
      sortedColumns,
      tableSize,
      openSetting,
      selectedRowKeys,
      innerPagination,
      handleCustomSearch,
      handleChange,
      handleOpenSetting,
      handleSearch,
      handleSelect,
      handleSelectAll,
      handleSelectionChange,
      handleEdit,
      handleDeleteBatch,
      handleDelete,
      handleSorterChange,
      handlePageSizeChange,
      handlePageChange,
    };
  },
});
</script>

<style lang="less">
@import '@arco-design/web-vue/es/index.less';
@import url('./style/index.less');
</style>
