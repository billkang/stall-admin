import type { PaginationProps } from '../../pagination/interface';
import type { TableColumnData, TableData } from '../../table/interface';
import { ref, createVNode, watch } from 'vue';
import { FilterXSS } from 'xss';
import Modal from '../../modal';
import Message from '../../message';
import IconQuestionCircle from '../../icon/icon-question-circle';
import { isValidValue } from '../../_utils/is';

export type RowKey = string | number;

const xss = new FilterXSS({});

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
  t,
}: {
  props: Record<string, any>;
  emit: any;
  t: (key: string, ...args: any[]) => string;
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
        if (isValidValue(val)) {
          formData[key] = typeof val === 'string' ? xss.process(val) : val;
        } else {
          delete formData[key];
        }
      });
    } else {
      formData = {};
    }

    const extraData: Record<string, any> = {};
    (props.columns as TableColumnData[])
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
      Message.warning(t(`table.maxSelectedKeysCount`, props.maxSelectedKeysCount));
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
        size: 'small',
        title: t(`table.deleteConfirm.batchTitle`),
        icon: createVNode(IconQuestionCircle),
        content: t(`table.deleteConfirm.content`),
        okText: t(`table.deleteConfirm.ok`),
        cancelText: t(`table.deleteConfirm.cancel`),
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
        title: t(`table.deleteConfirm.singleTitle`),
        icon: createVNode(IconQuestionCircle),
        content: t(`table.deleteConfirm.content`),
        size: 'small',
        okText: t(`table.deleteConfirm.ok`),
        cancelText: t(`table.deleteConfirm.cancel`),
        onOk() {
          selectedRowKeys.value = selectedRowKeys.value.filter(key => key !== record[props.rowKey]);

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
