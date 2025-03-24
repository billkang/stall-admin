import type { PaginationProps, TableData } from '@arco-design/web-vue';

import { ref, watch } from 'vue';

import { Message, Modal } from '@arco-design/web-vue';

export type RowKey = number | string;

/*
 * 自定义组合式函数，用于处理表格的各种操作和状态管理
 * @param props - 组件的属性对象
 * @param emit - 用于触发自定义事件的函数
 */
export function useTable({
  props,
  emit,
}: {
  // 用于触发自定义事件的函数，类型为任意类型
  emit: any;
  // 组件的属性对象，其键值对类型为任意类型
  props: Record<string, any>;
}) {
  // 初始化表单数据对象，用于存储搜索表单的数据
  let formData: Record<string, string> = {};
  // 使用 ref 定义选中行的键数组，初始为空数组
  const selectedRowKeys = ref<RowKey[]>([]);
  // 使用 ref 定义设置面板是否打开的状态，初始为 false
  const openSetting = ref<boolean>(false);
  // 使用 ref 定义当前聚焦的过滤器名称，初始为空字符串
  const focusedFilter = ref<string>('');

  // 使用 ref 定义分页器的配置，根据 props 中的 pagination 属性来初始化
  const pagination = ref<boolean | PaginationProps>(
    // 如果 props 中有 pagination 属性，则初始化分页器配置
    props.pagination
      ? {
          // 当前页码，初始为 1
          current: 1,
          // 每页显示的记录数，初始为 15
          pageSize: 15,
          // 总记录数，初始为 0
          total: 0,
          // 是否显示总记录数
          showTotal: true,
          // 是否显示每页显示记录数的选择器
          showPageSize: true,
          // 是否显示页码跳转器
          showJumper: true,
        }
      : // 如果 props 中没有 pagination 属性，则分页器配置为 false
        false,
  );

  // 监听 props 中的 pagination 属性的变化
  watch(
    () => props.pagination,
    (val) => {
      // 如果 val 为真，即 props 中有 pagination 属性
      if (val) {
        // 更新分页器配置中的 showTotal 属性
        (pagination.value as PaginationProps).showTotal = val.showTotal;
        // 更新分页器配置中的 total 属性
        (pagination.value as PaginationProps).total = val.total;
      } else {
        // 如果 val 为假，即 props 中没有 pagination 属性，则分页器配置为 false
        pagination.value = false;
      }
    },
    {
      // 深度监听
      deep: true,
      // 立即执行一次回调函数
      immediate: true,
    },
  );

  /*
   * 处理打开设置面板的操作
   */
  const handleOpenSetting = () => {
    openSetting.value = true;
  };

  /*
   * 处理搜索操作
   * @param data - 搜索表单的数据对象，可为 null
   */
  const handleSearch = (data: null | Record<string, string>) => {
    if (data) {
      Object.keys(data).forEach((key: string) => {
        // 获取当前键对应的值
        const val = data[key];
        // 如果值存在
        if (val) {
          // 将值添加到 formData 对象中
          formData[key] = val!;
        } else {
          // 如果值不存在，则从 formData 对象中删除该键
          delete formData[key];
        }
      });
    } else {
      // 如果 data 为 null，则清空 formData 对象
      formData = {};
    }

    // 初始化额外数据对象，用于存储列的额外数据
    const extraData: Record<string, any> = {};
    // 过滤出有 extra 属性的列，并遍历这些列
    (props.columns as any[])
      .filter((col) => !!col.extra)
      .forEach(({ dataIndex, extra }) => {
        // 将列的额外数据添加到 extraData 对象中
        extraData[dataIndex!] = extra;
      });

    // 如果分页器配置存在
    if (pagination.value) {
      // 将当前页码重置为 1
      (pagination.value as PaginationProps).current = 1;

      // 触发 search 事件，传递搜索表单数据、页码和每页显示记录数，以及额外数据
      emit(
        'search',
        {
          ...formData,
          page: 1,
          pageSize: (pagination.value as PaginationProps).pageSize,
        },
        extraData,
      );
    } else {
      // 如果分页器配置不存在，触发 search 事件，只传递搜索表单数据和额外数据
      emit(
        'search',
        {
          ...formData,
        },
        extraData,
      );
    }
  };

  /*
   * 处理页码变化的操作
   * @param page - 新的页码
   */
  const handlePageChange = (page: number) => {
    // 更新分页器配置中的当前页码
    (pagination.value as PaginationProps).current = page;

    // 触发 search 事件，传递搜索表单数据、新的页码和每页显示记录数
    emit('search', {
      ...formData,
      page,
      pageSize: (pagination.value as PaginationProps).pageSize,
    });
  };

  /*
   * 处理每页显示记录数变化的操作
   * @param pageSize - 新的每页显示记录数
   */
  const handlePageSizeChange = (pageSize: number) => {
    // 将当前页码重置为 1
    (pagination.value as PaginationProps).current = 1;
    // 更新分页器配置中的每页显示记录数
    (pagination.value as PaginationProps).pageSize = pageSize;

    // 触发 search 事件，传递搜索表单数据、页码 1 和新的每页显示记录数
    emit('search', {
      ...formData,
      page: 1,
      pageSize,
    });
  };

  /*
   * 处理行选择的操作
   * @param rowKeys - 选中行的键数组
   * @param rowKey - 当前选中行的键
   * @param record - 当前选中行的数据记录
   */
  const handleSelect = (
    rowKeys: RowKey[],
    rowKey: number | string,
    record: TableData,
  ) => {
    // 触发 select 事件，传递选中行的键数组、当前选中行的键和当前选中行的数据记录
    emit('select', rowKeys, rowKey, record);
  };

  /*
   * 处理全选操作
   * @param checked - 是否全选的布尔值
   */
  const handleSelectAll = (checked: boolean) => {
    // 触发 select-all 事件，传递是否全选的布尔值
    emit('select-all', checked);
  };

  /*
   * 处理选中行变化的操作
   * @param keys - 新的选中行的键数组
   */
  const handleSelectionChange = (keys: RowKey[]) => {
    // 如果选中的行数超过了最大允许选中的行数
    if (keys.length > props.maxSelectedKeysCount) {
      // 显示警告消息
      Message.warning(`最大允许选中 ${props.maxSelectedKeysCount} 条数据`);
      return;
    }

    // 更新选中行的键数组
    selectedRowKeys.value = keys;

    // 触发 selection-change 事件，传递新的选中行的键数组
    emit('selection-change', keys);
  };

  /*
   * 处理编辑操作
   * @param record - 要编辑的数据记录
   */
  const handleEdit = (record: Record<string, string>) => {
    // 触发 edit 事件，传递要编辑的数据记录
    emit('edit', record);
  };

  /*
   * 处理批量删除操作
   */
  const handleDeleteBatch = () => {
    Modal.confirm({
      title: `确定删除勾选的数据吗？`,
      content: `删除后不可恢复，请谨慎操作。`,
      okText: `删除`,
      cancelText: `取消`,
      onOk() {
        // 触发 delete-batch 事件，传递选中行的键数组
        emit('delete-batch', [...selectedRowKeys.value]);
        // 清空选中行的键数组
        selectedRowKeys.value = [];
      },
      onCancel() {
        // 触发 delete-cancel 事件，传递选中行的键数组
        emit('delete-cancel', [...selectedRowKeys.value]);
      },
    });
  };

  /*
   * 处理单条记录删除操作
   * @param record - 要删除的数据记录
   */
  const handleDelete = (record: Record<string, string>) => {
    // 弹出确认删除的模态框
    Modal.confirm({
      title: `确定删除当前数据吗？`,
      content: `删除后不可恢复，请谨慎操作。`,
      okText: `删除`,
      cancelText: `取消`,
      onOk() {
        // 从选中行的键数组中过滤掉要删除的行的键
        selectedRowKeys.value = selectedRowKeys.value.filter(
          (key) => key !== record[props.rowKey],
        );

        // 触发 delete 事件，传递要删除的数据记录
        emit('delete', record);
      },
      onCancel() {
        // 触发 delete-cancel 事件，传递要删除的数据记录
        emit('delete-cancel', record);
      },
    });
  };

  /*
   * 处理点击过滤器的操作
   * @param name - 点击的过滤器名称
   */
  const handleClickFilter = (name: string) => {
    // 更新当前聚焦的过滤器名称
    focusedFilter.value = name;
  };

  /*
   * 处理清除聚焦过滤器的操作
   */
  const handleClearFocusedFilter = () => {
    // 监听窗口的点击事件
    window.addEventListener('click', () => {
      // 将当前聚焦的过滤器名称设置为空字符串
      focusedFilter.value = '';
    });
  };

  // 返回需要暴露的状态和方法
  return {
    openSetting,
    selectedRowKeys,
    pagination,
    focusedFilter,
    handleOpenSetting,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleSelect,
    handleSelectAll,
    handleSelectionChange,
    handleEdit,
    handleDeleteBatch,
    handleDelete,
    handleClickFilter,
    handleClearFocusedFilter,
  };
}
