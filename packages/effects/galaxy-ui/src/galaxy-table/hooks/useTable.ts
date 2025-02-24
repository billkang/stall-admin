import type {
  PaginationProps,
  TableData,
} from '@arco-design/web-vue';
import { ref, watch } from 'vue';
import { Modal, Message } from '@arco-design/web-vue';

export type RowKey = string | number;

function flatten(data: any[]) {
  const ret: any[] = [];

  data.forEach(d => {
    ret.push(d);

    if (d?.children?.length > 0) {
      ret.push(...flatten(d?.children));
    }
  });

  return ret;
}

export function useTable({
  props,
  emit,
}: {
  props: Record<string, any>;
  emit: any;
}) {
  let formData: Record<string, string> = {};
  const selectedRowKeys = ref<RowKey[]>(props.defaultSelectedKeys || []);
  const openSetting = ref<boolean>(false);
  const focusedFilter = ref<string>('');

  const pagination = ref<PaginationProps | boolean>(
    !!props.pagination
      ? props.pagePosition === 'br'
        ? {
            current: 1,
            pageSize: 15,
            total: 0,
            showTotal: true,
            showPageSize: true,
            showJumper: true,
          }
        : {
            current: 1,
            pageSize: 15,
            total: 0,
            simple: true,
          }
      : false,
  );

  watch(
    () => props.pagination,
    val => {
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

  // 监听 defaultSelectedKeys 的变化，刷新内部 selectedRowKeys
  watch(
    () => props.defaultSelectedKeys,
    keys => {
      if (keys?.length > 0) {
        const dataKeys = flatten(props.dataSource).map((col: TableData) => col[props.rowKey]);
        selectedRowKeys.value = [...keys.filter((key: any) => dataKeys.includes(key))];
      }
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
      .filter(col => !!col.extra)
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

  const handleSorterChange = (dataIndex: string, direction: string) => {
    emit('search', {
      ...formData,
      dataIndex,
      direction,
    });
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

  const handleSelect = (rowKeys: RowKey[], rowKey: string | number, record: TableData) => {
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
    const { deleteBatch } = props.switchConfirm;

    if (deleteBatch) {
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
    } else {
      emit('delete-batch', [...selectedRowKeys.value]);
      selectedRowKeys.value = [];
    }
  };

  const handleDelete = (record: Record<string, string>) => {
    const { delete: _delete } = props.switchConfirm;

    if (_delete) {
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
    } else {
      selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== record[props.rowKey]);

      emit('delete', record);
    }
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
    handleSorterChange,
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
