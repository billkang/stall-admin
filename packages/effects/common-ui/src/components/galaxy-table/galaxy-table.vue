<template>
  <div class="stall-galaxy-table-container" :class="{ 'pagination-top': pagePosition === 'tr' }" ref="tableContainerRef">
    <header>
      <div class="table-header__left-section">
        <Filter
          v-if="permission.filter"
          :disabled="loading"
          :uuid="uuid"
          :columns="columns"
          :filter="filter"
          :multiMode="multiMode"
          @change-mode="handleChangeMode"
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
            v-if="showRowSelection && optional?.visible && !!permission.delete"
            :disabled="loading || selectedRowKeys.length < 1"
            @click="handleDeleteBatch">
            {{ textReplacement?.btn?.deleteBatch || t(`table.btns.delete`) }}
          </Button>

          <slot name="header-btns-after"></slot>
        </Space>
      </div>
    </header>

    <main>
      <Setting v-if="optional?.visible" v-model="openSetting" :uuid="uuid" :columns="columns" />

      <Table
        v-bind="$props"
        :row-key="rowKey"
        :mode="mode"
        :default-selected-keys="defaultSelectedKeys"
        :row-selection="showRowSelection ? { selectedRowKeys, showCheckedAll, type: rowSelectionType } : undefined"
        :loading="loading"
        :size="tableSize"
        :columns="sortedColumns.filter((c: any) => c.visible)"
        :data="dataSource"
        :pagination="innerPagination"
        :page-position="pagePosition"
        :virtualListProps="virtualListProps"
        :draggable="draggable"
        :scroll="scroll"
        :loadMore="loadMore"
        :stripe="stripe"
        :column-resizable="columnResizable"
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
        <template v-if="optional?.visible" #optional-title="{ column }">
          <div class="header-cell-action">
            {{ column.title }}

            <IconSettings v-if="optional?.visible" class="table__setting" @click="handleOpenSetting" />
          </div>
        </template>
        <template v-if="optional?.visible" #optional="{ record }">
          <Space>
            <slot name="table-action-before" :record="record"></slot>
            <Button
              v-if="typeof permission.edit === 'function' ? permission.edit(record) : permission.edit"
              type="text"
              @click="handleEdit(record)">
              {{ textReplacement?.btn?.edit || t(`table.btns.edit`) }}
            </Button>
            <Button
              v-if="typeof permission.delete === 'function' ? permission.delete(record) : permission.delete"
              type="text"
              @click="handleDelete(record)">
              {{ textReplacement?.btn?.delete || t(`table.btns.delete`) }}
            </Button>
            <slot name="table-action-after" :record="record"></slot>
          </Space>
        </template>
        <template v-if="optional?.visible" #pagination-total="slotProps">
          <slot name="pagination-total" :total="slotProps.total">
            <span v-if="selectedRowKeys.length > 0">
              {{ t(`table.pagination.selected`, selectedRowKeys.length, label) }}
            </span>
            <span v-else>{{ t(`table.pagination.total`, slotProps.total, label) }}</span>
          </slot>
        </template>
      </Table>
    </main>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { TableData, TableColumnData, TableDraggable, TableChangeExtra } from '../table';
import type { TableOperationColumn } from '../table/interface';
import type { VirtualListProps } from '../_components/virtual-list-v2/interface';
import type { TablePermission, TableSwitchConfirm, TableTextReplacement } from './types';
import type { PaginationProps } from '../pagination/interface';
import { defineComponent, ref, onBeforeUnmount } from 'vue';

import {
  Space,
  Button,
  Table,
  useI18n
} from 'ant-design-vue';

import IconSettings from '../icon/icon-settings';
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
      type: Array as PropType<TableColumnData[]>,
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
    /**
     * @zh 传递虚拟列表属性，传入此参数以开启虚拟滚动 [VirtualListProps](#VirtualListProps)
     * @type VirtualListProps
     * @version 0.0.32
     */
    virtualListProps: {
      type: Object as PropType<VirtualListProps>,
    },
    /**
     * @zh 表格拖拽排序的配置
     * @version 0.0.32
     */
    draggable: {
      type: Object as PropType<TableDraggable>,
    },
    /**
     * @zh 数据懒加载函数，传入时开启懒加载功能
     * @version 0.0.40
     */
    loadMore: {
      type: Function as PropType<(record: TableData, done: (children?: TableData[]) => void) => void>,
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
    // 权限控制
    permission: {
      type: Object as PropType<TablePermission>,
      default: () => ({
        filter: true, // 是否展示过滤器
        delete: true, // 是否可以删除
        edit: true, // 是否可以编辑
      }),
    },
    // 文本替换
    textReplacement: {
      type: Object as PropType<TableTextReplacement>,
    },
    // 是否关闭默认弹窗提示
    switchConfirm: {
      type: Object as PropType<TableSwitchConfirm>,
      default: () => ({
        delete: true,
        deleteBatch: true,
      }),
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
          column: TableColumnData | TableOperationColumn;
          rowIndex: number;
          columnIndex: number;
        }) => { rowspan?: number; colspan?: number } | void
      >,
    },
    /**
     * @zh 实现对操作栏的控制
     * @version 0.0.95
     */
    optional: {
      type: Object as PropType<{ visible: boolean; width: number }>,
      default: () => ({
        visible: true,
        width: 120,
      }),
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
     * @zh 分页位置
     * @version 0.0.89
     */
    pagePosition: {
      type: String as PropType<'br' | 'tr'>,
      default: 'br',
    },
    /**
     * @zh 默认已选择的行（非受控模式）优先于 `rowSelection`
     * @version 0.0.90
     */
    defaultSelectedKeys: {
      type: Array as PropType<(string | number)[]>,
    },
    /**
     * @zh 表格的滚动属性配置。
     * @version 0.0.91
     */
    scroll: {
      type: Object as PropType<{
        x?: number | string;
        y?: number | string;
        minWidth?: number | string;
        maxHeight?: number | string;
      }>,
    },
    /**
     * @zh 最大允许选中行数
     * @version 0.0.91
     */
    maxSelectedKeysCount: {
      type: Number,
      default: 50,
    },
    /**
     * @zh 是否开启斑马纹效果
     * @version 0.0.94
     */
    stripe: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否允许调整列宽
     * @version 0.0.107
     *
     */
    columnResizable: {
      type: Boolean,
      default: false,
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
  emits: ['search', 'change', 'edit', 'delete', 'delete-batch', 'delete-cancel'],
  expose: ['formData', 'innerPagination', 'selectedRowKeys'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const mode = ref<'table' | 'card'>('table');

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
    } = useTable({ props, emit, t });
    const { formData, sortedColumns, tableSize, dispose, handleCustomSearch } = useTableSetting(props);

    onBeforeUnmount(() => dispose());

    function handleChangeMode(_mode: 'table' | 'card') {
      mode.value = _mode;
    }

    function handleChange(data: TableData[], extra: TableChangeExtra, currentData: TableData[]) {
      emit('change', data, extra, currentData);
    }

    return {
      t,
      mode,
      tableContainerRef,
      formData,
      sortedColumns,
      tableSize,
      openSetting,
      selectedRowKeys,
      innerPagination,
      handleChangeMode,
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
