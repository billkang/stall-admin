# 自定义 Galaxy Table 组件开发指南

在现代前端开发中，表格组件是展示和操作数据的重要工具。本文将深入介绍一个功能强大的自定义表格组件 —— Galaxy Table，探讨其开发原则、业务目标、组件功能以及设计思路，帮助你更好地理解和构建高效的数据展示工具。

## **1. 引言**

在数据驱动的场景下，表格组件需要具备强大的性能、丰富的功能和良好的交互体验。Galaxy Table 作为一款基于 Vue 3 的自定义表格组件，旨在满足这些需求，提供一种灵活、可定制且易于扩展的解决方案。

## **2. Vue 3 自定义组件开发原则**

- **组件化**：将复杂的界面拆分为多个独立的组件，每个组件负责特定的功能或 UI 元素。组件之间通过 Props 和 Events 进行通信。
- **响应式**：利用 Vue 的响应式系统（`ref` 和 `reactive`），确保组件状态的变化能够自动触发视图更新。
- **单向数据流**：数据从父组件传递到子组件，通过 Props 实现；子组件通过 Events 向父组件发送消息，保证数据流的可预测性。
- **可复用性**：将通用逻辑封装为自定义 Hooks 或高阶组件，提高代码的复用性和可维护性。

## **3. Galaxy Table 的业务目标**

Galaxy Table 的核心目标是为用户提供一个高度可定制且功能强大的表格解决方案，具体包括：

- **数据展示**：以表格形式展示大量数据，支持丰富的列配置（如列宽、对齐方式、数据格式化等）。
- **交互操作**：支持多选、排序、筛选、分页等交互操作，提高数据处理效率。
- **功能扩展**：通过插槽和自定义 Hooks，方便用户扩展表格的功能，如添加自定义筛选器、操作列等。
- **性能优化**：针对大数据量场景，采用虚拟滚动等技术提升表格的渲染性能。

## **4. 代码片段功能与 Hooks 的串联作用**

Galaxy Table 由多个组件和 Hooks 构成，以下是各部分的功能和它们之间的关系：

### **4.1 组件功能**

- **`GalaxyTable` 组件**：
  - 核心表格容器，负责渲染表格头部、内容和底部。
  - 提供插槽（如筛选器、操作列）和 Props（如列配置、数据源、分页配置）。
  - 集成了筛选器、分页器和列设置功能。
  - 通过自定义 Hooks（`useTable` 和 `useTableSetting`）管理表格状态和业务逻辑。

- **`Filter` 组件**：
  - 提供多列筛选功能，支持选择器、输入搜索和自定义筛选器。
  - 通过插槽允许用户扩展筛选器的内容。
  - 负责收集用户筛选条件并通过事件传递给父组件。

- **`Setting` 组件**：
  - 提供表格设置功能，包括列的显示/隐藏、排序和表格样式调整（如显示密度、文本控制方式）。
  - 使用树形结构管理列的显示状态。
  - 通过事件通知父组件设置的变化。

- **`Drawer` 组件**：
  - 提供一个抽屉式界面，用于展示表格设置和筛选结果摘要。
  - 支持自定义内容和事件回调。

### **4.2 Hooks 功能与串联**

- **`useTable` Hook**：
  - 管理表格的核心状态和交互逻辑，包括搜索、分页、行选择和删除等。
  - 提供方法（如 `handleSearch`、`handlePageChange`、`handleSelectAll`）来响应用户的操作。
  - 通过 Ref 和 Watch 监听状态变化，并触发相应的事件。

```js
import { ref, watch } from 'vue';

export function useTable({ props, emit }: { props: any; emit: any }) {
  // 表单数据
  let formData: Record<string, string> = {};

  // 选中行的键数组
  const selectedRowKeys = ref<RowKey[]>([]);

  // 设置面板状态
  const openSetting = ref<boolean>(false);

  // 分页器配置
  const pagination = ref<PaginationProps | boolean>( {/* 初始化配置 */ } );

  // 监听分页器配置的变化
  watch(
    () => props.pagination,
    (val) => {
      // 更新分页器配置
    },
    { deep: true, immediate: true },
  );

  // 处理搜索事件
  const handleSearch = (data: Record<string, string> | null) => {
    // 更新表单数据并触发搜索
  };

  // 处理页码变化
  const handlePageChange = (pageIndex: number) => {
    // 更新分页器当前页码
  };

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    // 触发全选事件
  };

  // 处理批量删除
  const handleDeleteBatch = () => {
    // 批量删除逻辑
  };

  return {
    formData,
    selectedRowKeys,
    pagination,
    openSetting,
    handleSearch,
    handlePageChange,
    handleSelectAll,
    handleDeleteBatch,
  };
}
```

- **`useTableSetting` Hook**：
  - 管理表格的设置逻辑，包括列配置、表格尺寸和文本控制方式等。
  - 提供方法（如 `setTextControl`、`setTableSize`、`resetFormData`）来更新表格设置。
  - 使用 `localStorage` 保存用户的设置，实现持久化。

```js
import { ref, reactive, computed, watch } from 'vue';

export function useTableSetting(props: { uuid: string; columns?: any[]; optional?: { visible: boolean; width: number } }) {
  const formData = reactive<Record<string, any>>({});

  // 合并后的列配置
  const mergedColumns = ref<any[]>([]);

  // 表格尺寸
  const tableSize = ref<TableSize>('small');

  // 文本控制方式
  const textControl = ref<TableTextControl>('wrap');

  // 初始化列配置
  const initSetting = () => {
    // 从 localStorage 加载列配置
  };

  // 保存排序后的列配置
  const saveSortedColumns = (columns: any[]) => {
    // 保存到 localStorage
  };

  // 设置文本控制方式
  const setTextControl = (type: TableTextControl) => {
    // 更新文本控制方式并保存
  };

  return {
    formData,
    mergedColumns,
    tableSize,
    textControl,
    saveSortedColumns,
    setTextControl,
  };
}
```

## **5. 设计思路与核心代码**

Galaxy Table 的设计基于以下思路：

- **组件化**：将表格的功能拆分为多个独立的组件（如 `Filter`、`Setting`），通过 Props 和 Events 实现组件间的通信。
- **响应式**：利用 Vue 的响应式系统管理表格状态，确保视图与数据的同步。
- **可复用性**：通过自定义 Hooks 封装通用逻辑，提高代码的复用性和可维护性。

以下是核心代码示例：

## **5.1 表格模板结构**

```vue
<template>
  <div class="stall-galaxy-table-container">
    <!-- 表格头部 -->
    <header>
      <div class="table-header__left-section">
        <!-- 筛选器 -->
        <Filter @custom-search="handleSearch" />
      </div>
      <div class="table-header__right-section">
        <Space>
          <!-- 删除按钮 -->
          <Button @click="handleDeleteBatch">批量删除</Button>
        </Space>
      </div>
    </header>

    <!-- 表格主体 -->
    <main>
      <!-- 表格设置 -->
      <Setting v-model="openSetting" />

      <!-- 表格组件 -->
      <Table
        :columns="mergedColumns"
        :data="dataSource"
        :pagination="pagination"
        @page-change="handlePageChange"
      />
    </main>
  </div>
</template>
```

- **说明**：`GalaxyTable` 是表格的主容器，通过 `Filter` 组件提供筛选功能，`Setting` 组件提供设置功能，`Table` 组件则负责渲染表格数据。

## **5.2 筛选器组件功能解析**

```vue
<template>
  <div class="stall-galaxy-table-filter">
    <Space>
      <!-- 自定义插槽：前置内容 -->
      <slot name="filter-before"></slot>

      <!-- 筛选器选择器 -->
      <FilterSelector
        v-for="column in filterableColumns"
        :key="column.dataIndex"
        :column="column"
      />

      <!-- 渲染更多筛选器的下拉菜单 -->
      <FilterMoreFilterDropdown
        :uuid="uuid"
        :filterableColumns="filterableColumns"
        @custom-search="handleCustomSearch"
        @reset="handleReset"
        @submit="handleSearch" />
    </Space>

    <!-- 筛选结果摘要 -->
    <FilterSummary :columns="columns" @search="handleSearch" />
  </div>
</template>
```

- **说明**：`Filter` 组件通过 `v-for` 循环渲染筛选器选择器，支持多列筛选。自定义插槽 `filter-before` 允许用户扩展筛选器的内容。`FilterSummary` 组件展示筛选结果摘要。

## **5.3 分页功能代码及说明**

```typescript
const handlePageChange = (pageIndex: number) => {
  (pagination.value as PaginationProps).current = pageIndex;
  emit('search', { ...formData, pageIndex, pageSize: pagination.value.pageSize });
};
```

- **说明**：`handlePageChange` 方法用于处理页码变化，更新分页器的当前页码，并触发 `search` 事件，通知父组件进行数据查询。

## **5.4 行选择与删除功能**

```typescript
const handleSelectAll = (checked: boolean) => {
  emit('select-all', checked);
};

const handleDeleteBatch = () => {
  Modal.confirm({
    title: '确认删除?',
    onOk() {
      emit('delete-batch', [...selectedRowKeys.value]);
    },
  });
};
```

- **说明**：`handleSelectAll` 方法用于处理全选操作，`handleDeleteBatch` 方法用于处理批量删除操作，通过模态框确认删除，并触发 `delete-batch` 事件。

## **6. 总结**

通过 Vue 3 的组件化、响应式和 Hooks，Galaxy Table 实现了复杂表格的功能和交互。组件之间的通信通过 Props 和 Events 实现，状态管理通过自定义 Hooks 和 `localStorage` 实现。希望这篇指南能帮助你更好地理解和开发自定义表格组件。
