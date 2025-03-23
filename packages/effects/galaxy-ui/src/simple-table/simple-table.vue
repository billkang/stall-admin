<template>
  <div class="stall-galaxy-table-container">
    <!-- 表格头部 -->
    <header>
      <!-- 左侧区域 -->
      <div class="table-header__left-section">
        <!-- 筛选器组件 -->
        <Filter
          :disabled="loading"
          :uuid="uuid"
          :columns="columns"
          :filter="filter"
          @search="handleSearch">
          <!-- 自定义插槽：筛选器前置内容 -->
          <template #filter-before>
            <slot name="filter-before"></slot>
          </template>
          <!-- 自定义插槽：筛选器后置内容 -->
          <template #filter-after>
            <slot name="filter-after"></slot>
          </template>
        </Filter>
      </div>

      <!-- 右侧区域 -->
      <div class="table-header__right-section">
        <!-- 按钮组 -->
        <Space :size="8">
          <!-- 自定义插槽：头部按钮前置内容 -->
          <slot name="header-btns-before"></slot>

          <!-- 删除按钮 -->
          <Button
            :disabled="loading || selectedRowKeys.length < 1"
            @click="handleDeleteBatch">
            删除
          </Button>

          <!-- 自定义插槽：头部按钮后置内容 -->
          <slot name="header-btns-after"></slot>
        </Space>
      </div>
    </header>

    <!-- 表格主体 -->
    <main>
      <!-- 表格设置组件 -->
      <Setting v-model="openSetting" :uuid="uuid" :columns="columns" />

      <!-- 表格组件 -->
      <Table
        v-bind="$props"
        :row-key="rowKey"
        :row-selection="showRowSelection ? { selectedRowKeys, showCheckedAll } : undefined"
        :loading="loading"
        :size="tableSize"
        :columns="mergedColumns.filter((c: any) => c.visible)"
        :data="dataSource"
        :pagination="innerPagination"
        @change="handleChange"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange">
        <!-- 自定义插槽：卡片项 -->
        <template #card-item="{ record, index }">
          <slot name="card-item" :record="record" :index="index"></slot>
        </template>
        <!-- 自定义插槽：列 -->
        <template #columns>
          <slot name="columns"></slot>
        </template>
        <!-- 自定义插槽：操作列标题 -->
        <template #optional-title="{ column }">
          <div class="header-cell-action">
            {{ column.title }}

            <!-- 设置图标 -->
            <IconSettings class="table__setting" @click="handleOpenSetting" />
          </div>
        </template>
        <!-- 自定义插槽：操作列 -->
        <template #optional="{ record }">
          <Space>
            <!-- 自定义插槽：操作栏前置内容 -->
            <slot name="table-action-before" :record="record"></slot>

            <!-- 编辑按钮 -->
            <Button
              type="text"
              @click="handleEdit(record)">
              编辑
            </Button>

            <!-- 删除按钮 -->
            <Button
              type="text"
              @click="handleDelete(record)">
              删除
            </Button>

            <!-- 自定义插槽：操作栏后置内容 -->
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
  name: 'SimpleTable', // 组件名称
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
      required: true, // 必须传入 uuid
    },
    rowKey: {
      type: String,
      default: 'id', // 默认值为 'id'
    },
    loading: {
      type: Boolean,
      default: false, // 默认不加载
    },
    columns: {
      type: Array as PropType<any[]>,
      required: true, // 必须传入列配置
    },
    dataSource: {
      type: Array as PropType<TableData[]>,
      required: true, // 必须传入数据源
    },
    pagination: {
      type: [Boolean, Object] as PropType<boolean | PaginationProps>,
      default: () => ({
        total: 0,
        showTotal: true,
      }), // 默认分页配置
    },
    showCheckedAll: {
      type: Boolean,
      default: true, // 默认显示全选
    },
    showRowSelection: {
      type: Boolean,
      default: true, // 默认显示行选择
    },
    optional: {
      type: Object as PropType<{ visible: boolean; width: number }>,
      default: () => ({
        visible: true,
        width: 120,
      }), // 默认操作列配置
    },
    filter: {
      type: Object as PropType<{
        selector: boolean;
        moreFilter: boolean;
        inputSearch: boolean;
        summary: boolean;
      }>,
      default: () => ({
        selector: true,
        moreFilter: true,
        inputSearch: true,
        summary: true,
      }), // 默认筛选器配置
    },
  },
  emits: ['search', 'change', 'edit', 'delete', 'delete-batch', 'delete-cancel'], // 定义组件触发的事件
  expose: ['innerPagination', 'selectedRowKeys'], // 暴露的属性
  setup(props, { emit }) {
    // 使用 useTable 钩子获取表格逻辑
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
      handlePageChange,
      handlePageSizeChange,
    } = useTable({ props, emit });

    // 使用 useTableSetting 钩子获取表格设置逻辑
    const { mergedColumns, tableSize, dispose } = useTableSetting(props);

    // 组件卸载时清理资源
    onBeforeUnmount(() => dispose());

    // 处理表格数据变化
    function handleChange(data: TableData[], extra: TableChangeExtra, currentData: TableData[]) {
      emit('change', data, extra, currentData);
    }

    return {
      mergedColumns, // 合并后的列配置
      tableSize, // 表格尺寸
      openSetting, // 设置面板状态
      selectedRowKeys, // 选中的行键
      innerPagination, // 内部分页配置
      handleChange, // 数据变化处理
      handleOpenSetting, // 打开设置面板方法
      handleSearch, // 搜索方法
      handleSelect, // 选择行方法
      handleSelectAll, // 全选方法
      handleSelectionChange, // 选择变化方法
      handleEdit, // 编辑方法
      handleDeleteBatch, // 批量删除方法
      handleDelete, // 删除方法
      handlePageSizeChange, // 分页大小变化方法
      handlePageChange, // 分页变化方法
    };
  },
});
</script>

<style lang="less">
@import '@arco-design/web-vue/es/index.less'; // 引入 Arco Design 样式
@import url('./style/index.less'); // 引入自定义样式
</style>
