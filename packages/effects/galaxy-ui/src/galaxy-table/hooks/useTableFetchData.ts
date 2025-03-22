import type { Ref } from 'vue';

import { ref, unref } from 'vue';

type TablePagination = {
  showTotal: boolean;
  total: number;
};

/*
 * 自定义组合式函数，用于处理表格数据的获取逻辑
 * @param fn - 用于获取数据的异步函数
 * @param tableRef - 可选的表格引用，用于获取分页和表单数据
 * @returns 包含加载状态、数据源、分页信息和获取数据函数的对象
 */
export function useTableFetchData(fn: Function, tableRef?: Ref<any>) {
  // 使用 ref 创建一个响应式变量 loading，用于表示数据加载状态，初始值为 false
  const loading = ref<boolean>(false);
  // 使用 ref 创建一个响应式变量 dataSource，用于存储表格的数据源，初始值为空数组
  const dataSource = ref<any[]>([]);
  // 使用 ref 创建一个响应式变量 pagination，用于存储分页信息，初始时包含 total 为 0 和 showTotal 为 true
  const pagination = ref<TablePagination | undefined>({
    total: 0,
    showTotal: true,
  });

  /*
   * 异步函数，用于获取表格数据
   * @param params - 可选的参数对象，用于传递额外的请求参数
   */
  async function fetchData(params: Record<string, any> = {}) {
    try {
      // 开始加载数据，将 loading 状态设置为 true
      loading.value = true;
      // 从 tableRef 中获取当前页码和每页显示数量，如果 tableRef 不存在则使用默认值
      const { current, pageSize } = (tableRef &&
        unref(tableRef)?.innerPagination) || { current: 1, pageSize: 15 };
      // 从 tableRef 中获取表单数据，如果 tableRef 不存在则使用空对象
      const formData = (tableRef && unref(tableRef)?.formData) || {};

      // 调用传入的异步函数 fn，传递分页信息、表单数据和额外的请求参数
      const data = await fn({
        pageIndex: current,
        pageSize,
        ...formData,
        ...params,
      });

      // 判断返回的数据是否为数组
      if (Array.isArray(data)) {
        // 如果是数组，直接将数据赋值给 dataSource，并将分页信息设置为 undefined
        dataSource.value = data;
        pagination.value = undefined;
      } else {
        // 如果不是数组，从返回的数据中解构出 items 和 totalCount
        const { items, totalCount } = data;
        // 将 items 赋值给 dataSource
        dataSource.value = items;
        // 更新分页信息中的 total 为 totalCount
        pagination.value!.total = totalCount;
      }
    } finally {
      // 无论数据获取成功还是失败，都将 loading 状态设置为 false
      loading.value = false;
    }
  }

  // 返回包含加载状态、数据源、分页信息和获取数据函数的对象
  return {
    loading,
    dataSource,
    pagination,
    fetchData,
  };
}
