import type { PaginationProps, TableData } from '@arco-design/web-vue';
import { ref, watch } from 'vue';
import { Modal, Message } from '@arco-design/web-vue';

export type RowKey = string | number;

export function useTable({
  props,
  emit,
}: {
  props: Record<string, any>;
  emit: any;
}) {
  let formData: Record<string, string> = {};
  const selectedRowKeys = ref<RowKey[]>([]);
  const openSetting = ref<boolean>(false);
  const focusedFilter = ref<string>('');

  const pagination = ref<PaginationProps | boolean>(
    !!props.pagination
      ? {
          current: 1,
          pageSize: 15,
          total: 0,
          showTotal: true,
          showPageSize: true,
          showJumper: true,
        }
      : false,
  );

  watch(
    () => props.pagination,
    (val) => {
      if (val) {
        (pagination.value as PaginationProps).showTotal = val.showTotal;
        (pagination.value as PaginationProps).total = val.total;
      } else {
        pagination.value = false;
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const handleOpenSetting = () => {
    openSetting.value = true;
  };

  const handleSearch = (data: Record<string, string> | null) => {
    if (data) {
      Object.keys(data).forEach((key: string) => {
        const val = data[key];
        if (val) {
          formData[key] = val!;
        } else {
          delete formData[key];
        }
      });
    } else {
      formData = {};
    }

    const extraData: Record<string, any> = {};
    (props.columns as any[])
      .filter((col) => !!col.extra)
      .forEach(({ dataIndex, extra }) => {
        extraData[dataIndex!] = extra;
      });

    if (pagination.value) {
      (pagination.value as PaginationProps).current = 1;

      emit(
        'search',
        {
          ...formData,
          pageIndex: 1,
          pageSize: (pagination.value as PaginationProps).pageSize,
        },
        extraData,
      );
    } else {
      emit(
        'search',
        {
          ...formData,
        },
        extraData,
      );
    }
  };

  const handlePageChange = (pageIndex: number) => {
    (pagination.value as PaginationProps).current = pageIndex;

    emit('search', {
      ...formData,
      pageIndex,
      pageSize: (pagination.value as PaginationProps).pageSize,
    });
  };

  const handlePageSizeChange = (pageSize: number) => {
    (pagination.value as PaginationProps).current = 1;
    (pagination.value as PaginationProps).pageSize = pageSize;

    emit('search', {
      ...formData,
      pageIndex: 1,
      pageSize,
    });
  };

  const handleSelect = (
    rowKeys: RowKey[],
    rowKey: string | number,
    record: TableData,
  ) => {
    emit('select', rowKeys, rowKey, record);
  };

  const handleSelectAll = (checked: boolean) => {
    emit('select-all', checked);
  };

  const handleSelectionChange = (keys: RowKey[]) => {
    if (keys.length > props.maxSelectedKeysCount) {
      Message.warning(`最大允许选中 ${props.maxSelectedKeysCount} 条数据`);
      return;
    }

    selectedRowKeys.value = keys;

    emit('selection-change', keys);
  };

  const handleEdit = (record: Record<string, string>) => {
    emit('edit', record);
  };

  const handleDeleteBatch = () => {
    Modal.confirm({
      title: `确定删除勾选的数据吗？`,
      content: `删除后不可恢复，请谨慎操作。`,
      okText: `删除`,
      cancelText: `取消`,
      onOk() {
        emit('delete-batch', [...selectedRowKeys.value]);
        selectedRowKeys.value = [];
      },
      onCancel() {
        emit('delete-cancel', [...selectedRowKeys.value]);
      },
    });
  };

  const handleDelete = (record: Record<string, string>) => {
    Modal.confirm({
      title: `确定删除当前数据吗？`,
      content: `删除后不可恢复，请谨慎操作。`,
      okText: `删除`,
      cancelText: `取消`,
      onOk() {
        selectedRowKeys.value = selectedRowKeys.value.filter(
          (key) => key !== record[props.rowKey],
        );

        emit('delete', record);
      },
      onCancel() {
        emit('delete-cancel', record);
      },
    });
  };

  const handleClickFilter = (name: string) => {
    focusedFilter.value = name;
  };

  const handleClearFocusedFilter = () => {
    window.addEventListener('click', () => {
      focusedFilter.value = '';
    });
  };

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
