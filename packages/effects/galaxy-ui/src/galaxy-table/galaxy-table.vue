<template>
  <div class="stall-galaxy-table-container" ref="tableContainerRef">
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
        :default-selected-keys="defaultSelectedKeys"
        :row-selection="showRowSelection ? { selectedRowKeys, showCheckedAll, type: rowSelectionType } : undefined"
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
        <template #pagination-total="slotProps">
          <slot name="pagination-total" :total="slotProps.total">
          </slot>
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
import { useTableInit } from './hooks/useTableInit';
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
    label: {
      type: String,
      default: '',
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
     * @type TablePagination
     * @version 0.0.54
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
    rowSelectionType: {
      type: String as PropType<'checkbox' | 'radio'>,
      default: 'checkbox',
    },
    /**
     * @zh 表格行元素的类名
     * @version 0.0.59
     */
    rowClass: {
      type: [String, Array, Object, Function] as PropType<
        string | any[] | Record<string, any> | ((record: TableData, rowIndex: number) => any)
      >,
    },
    /**
     * @zh 单元格合并方法（索引从数据项开始计数）
     * @version 0.0.64
     */
    spanMethod: {
      type: Function as PropType<
        (data: {
          record: TableData;
          column: any;
          rowIndex: number;
          columnIndex: number;
        }) => { rowspan?: number; colspan?: number } | void
      >,
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
     * @zh 默认已选择的行（非受控模式）优先于 `rowSelection`
     * @version 0.0.90
     */
    defaultSelectedKeys: {
      type: Array as PropType<(string | number)[]>,
    },
    /**
     * @zh 最大允许选中行数
     * @version 0.0.91
     */
    maxSelectedKeysCount: {
      type: Number,
      default: 50,
    },
  },
  emits: ['search', 'change', 'edit', 'delete', 'delete-batch', 'delete-cancel'],
  expose: ['formData', 'innerPagination', 'selectedRowKeys'],
  setup(props, { emit }) {
    const { tableContainerRef } = useTableInit();
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
      tableContainerRef,
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
