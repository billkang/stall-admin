import type { Ref } from 'vue';

import type { TablePagination } from '../types';

import { ref, unref } from 'vue';

export function useTableFetchData(fn: Function, tableRef?: Ref<any>) {
  const loading = ref<boolean>(false);
  const dataSource = ref<any[]>([]);
  const pagination = ref<TablePagination | undefined>({
    total: 0,
    showTotal: true,
  });

  async function fetchData(params: Record<string, any> = {}) {
    try {
      loading.value = true;
      const { current, pageSize } = (tableRef &&
        unref(tableRef)?.innerPagination) || { current: 1, pageSize: 15 };
      const formData = (tableRef && unref(tableRef)?.formData) || {};

      const data = await fn({
        page: current,
        pageSize,
        ...formData,
        ...params,
      });

      if (Array.isArray(data)) {
        dataSource.value = data;
        pagination.value = undefined;
      } else {
        const { items, total } = data;
        dataSource.value = items;
        pagination.value!.total = total;
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    dataSource,
    pagination,
    fetchData,
  };
}
