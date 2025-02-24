import type { UnwrapNestedRefs } from 'vue';
import { ref, reactive, computed, watch } from 'vue';

export type TableTextControl = 'wrap' | 'ellipsis';
export type TableSize = 'large' | 'small';
export type FormData = Record<string, string | number | boolean | null>;

const CACHE_TABLE_SETTING: Record<string, any> = {};

function initTableSetting(uuid: string, columns: any[], optional?: { visible: boolean; width: number }) {
  // localStorage-keys
  let SETTING_SIZE_KEY: string;
  let SETTING_TEXT_CONTROL_KEY: string;
  let SETTING_SORT_KEY: string;
  let SETTING_CUSTOM_FILTER_KEY: string;

  // filter-form data
  let formData: UnwrapNestedRefs<FormData> = {};

  const sortedColumns = ref<any[]>([]);
  const tableSize = ref<TableSize>('small');
  const textControl = ref<TableTextControl>('wrap');
  const customFilters = reactive<Map<string, FormData>>(new Map());

  // 首先必须需要设置过滤条件配置项
  // 1. col.visible 为true，并且 filterable.visible 明确不为false
  // 2. filterable.visible 明确设置为true
  const filterableColumns = computed(() =>
    sortedColumns.value.filter(
      c =>
        (c.filterable?.componentType || c.filterable?.filters?.length) &&
        ((!!c.visible && c.filterable?.visible !== false) || !!c.filterable?.visible),
    ),
  );
  const inputSearchColumns = computed(() =>
    filterableColumns.value.filter(c => c.filterable?.componentType === 'input'),
  );

  // 监听过滤列表的变化，当他们变的不可见时，不支持搜索
  watch(
    () => sortedColumns,
    newColumns => {
      newColumns.value
        .filter(c => c.filterable?.visible !== false) // 首先过滤掉那些明确不能被筛选的 col
        .forEach(c => {
          // 如果 col 变为不可见，也不需要出现在最终的 search 事件返回的 data 中
          if (c.dataIndex && !c.visible) {
            formData[c.dataIndex] = null;
          }
        });

      saveSortedColumns(newColumns.value);
    },
    {
      deep: true,
    },
  );

  // columns 用户侧和hooks分别会进行配置，会添加很多属性
  // 导致无法很好很好的判断column是否进行了更改
  // 所以每次都对用户传入的columns和缓存的cachedColumns进行合并操作
  // 各配置项的优先级：新传入的 > 缓存的 > 默认值
  function getMergedColumns(columns: any[]) {
    let cachedColumns: any[] | undefined;
    try {
      cachedColumns = JSON.parse(window.localStorage.getItem(SETTING_SORT_KEY) || '');
    } catch {}

    let mergedColumns: any[];

    // 如果 columns 长度没有变化（cachedColumns包含一个optional列，所以长度多1），则以缓存的columns为主
    if (
      cachedColumns &&
      (optional?.visible ? cachedColumns.length === columns.length + 1 : cachedColumns.length === columns.length)
    ) {
      mergedColumns = [
        ...cachedColumns.map((col: any) => {
          if (col.dataIndex === 'optional') {
            return col;
          }

          const newCol = columns.find((c: any) => c.dataIndex === col.dataIndex);

          const _ellipsis = !!newCol?.ellipsis || col.ellipsis || textControl.value === 'ellipsis';
          const _filterable =
            newCol?.filterable || newCol?.filters || newCol?.filterSearch || newCol?.filterType
              ? {
                  ...newCol?.filterable,
                  filters: newCol?.filters || newCol?.filterable?.filters,
                  componentType: !!newCol?.filterSearch
                    ? 'input'
                    : newCol?.filterType || newCol?.filterable?.componentType,
                }
              : col.filterable;

          return {
            visible: newCol?.visible !== undefined && newCol?.visible !== null ? newCol?.visible : true,
            ...col,
            ...newCol,
            ellipsis: _ellipsis,
            filterable: _filterable,
          };
        }),
      ];
    } else {
      mergedColumns = [
        ...columns.map((col: any) => {
          const cachedCol = cachedColumns?.find((c: any) => c.dataIndex === col.dataIndex);

          const _ellipsis = !!col.ellipsis || cachedCol?.ellipsis || textControl.value === 'ellipsis';
          const _filterable =
            col.filterable || col.filters || col.filterSearch || col.filterType
              ? {
                  ...col.filterable,
                  filters: col.filters || col.filterable?.filters,
                  componentType: !!col.filterSearch ? 'input' : col.filterType || col.filterable?.componentType,
                }
              : cachedCol?.filterable;

          return {
            visible: col.visible !== undefined && col.visible !== null ? col.visible : true,
            ...cachedCol,
            ...col,
            ellipsis: _ellipsis,
            filterable: _filterable,
          };
        }),
      ];

      if (optional?.visible) {
        mergedColumns.push({
          title: '操作',
          dataIndex: 'optional',
          slotName: 'optional',
          titleSlotName: 'optional-title',
          visible: true,
          fixed: 'right',
          width: optional?.width || 120,
        });
      }
    }

    return mergedColumns;
  }

  // 初始化
  function initSetting(uuid: string, columns: any[]) {
    SETTING_SIZE_KEY = `GTABLE__SETTING_SIZE__${uuid}`;
    SETTING_TEXT_CONTROL_KEY = `GTABLE__SETTING_TEXT_CONTROL__${uuid}`;
    SETTING_SORT_KEY = `GTABLE__SETTING_SORT__${uuid}`;
    SETTING_CUSTOM_FILTER_KEY = `GTABLE__SETTING_CUSTOM_FILTER__${uuid}`;

    // 设置 table-size table-text-control
    tableSize.value = (window.localStorage.getItem(SETTING_SIZE_KEY) as TableSize) || 'small';
    textControl.value = (window.localStorage.getItem(SETTING_TEXT_CONTROL_KEY) as TableTextControl) || 'wrap';

    // 初始化-列表项
    sortedColumns.value = getMergedColumns(columns);

    // 初始化formData
    const cols: FormData = {};
    filterableColumns.value.forEach(c => {
      cols[`${c.dataIndex}`] = null;
    });
    formData = reactive(cols);
  }

  initSetting(uuid, columns);

  function saveSortedColumns(columns: any[]) {
    window.localStorage.setItem(SETTING_SORT_KEY, JSON.stringify(columns));
  }

  function setTextControl(type: TableTextControl) {
    textControl.value = type;
    window.localStorage.setItem(SETTING_TEXT_CONTROL_KEY, type);

    sortedColumns.value
      .filter(c => c.dataIndex !== 'optional')
      .forEach(col => {
        const original = columns.find(c => c.dataIndex === col.dataIndex);
        col.ellipsis = !!original?.ellipsis || type === 'ellipsis';
      });
  }

  function setTableSize(size: TableSize) {
    tableSize.value = size;
    window.localStorage.setItem(SETTING_SIZE_KEY, size);
  }

  // 重置formData
  function resetFormData(newData?: FormData) {
    Object.keys(formData).forEach(key => (formData[key] = null));

    if (newData) {
      Object.keys(newData).forEach(key => (formData[key] = newData[key]!));
    }
  }

  // 重置formData
  function cleanFormDataByKey(key: string) {
    Object.keys(formData).forEach(_key => {
      if (_key === key) {
        formData[key] = null;
      }
    });
  }

  // 获取自定义筛选
  function getCustomFilter() {
    if (customFilters.size > 0) {
      return customFilters;
    } else {
      const filterStr = window.localStorage.getItem(SETTING_CUSTOM_FILTER_KEY);

      if (filterStr) {
        const obj = JSON.parse(filterStr);
        Object.keys(obj).forEach((key: string) => {
          customFilters.set(key, obj[key]);
        });
      }

      return customFilters;
    }
  }

  // 刷新custom-filter在localStorage中的值
  function refreshCustomFilterStorage() {
    const ret: Record<string, FormData> = {};
    customFilters.forEach((val: FormData, key: string) => {
      ret[key] = val;
    });

    window.localStorage.setItem(SETTING_CUSTOM_FILTER_KEY, JSON.stringify(ret));
  }

  // 保存自定义筛选
  function saveCustomFilter(name: string, formData: FormData) {
    if (customFilters.has(name)) {
      const text = `已存在同名筛选`;
      throw Error(text);
    }

    customFilters.set(name, { ...formData });

    refreshCustomFilterStorage();
  }

  // 删除自定义筛选
  function deleteCustomFilter(name: string) {
    if (customFilters.has(name)) {
      customFilters.delete(name);

      refreshCustomFilterStorage();
    }
  }

  function dispose() {
    CACHE_TABLE_SETTING[uuid] = null;
  }

  async function handleCustomSearch(data: Record<string, any>) {
    const { key, value } = data;
    const col = filterableColumns.value.find(col => col.dataIndex === key);
    if (col?.filterable?.customSearch) {
      await col.filterable.customSearch(value, col);
    }
  }

  return {
    resetFormData,
    cleanFormDataByKey,
    getCustomFilter,
    saveCustomFilter,
    deleteCustomFilter,
    formData,
    filterableColumns,
    inputSearchColumns,
    saveSortedColumns,
    sortedColumns,
    setTableSize,
    tableSize,
    setTextControl,
    textControl,
    dispose,
    handleCustomSearch,
  };
}

export function useTableSetting(props: {
  uuid: string;
  columns?: any[];
  optional?: { visible: boolean; width: number };
}) {
  const { uuid, columns, optional } = props;
  const cacheSetting = CACHE_TABLE_SETTING[uuid];

  if (columns) {
    if (!cacheSetting) {
      CACHE_TABLE_SETTING[uuid] = initTableSetting(uuid, columns, optional);
    }

    return CACHE_TABLE_SETTING[uuid];
  } else {
    if (!cacheSetting) {
      throw Error(`unknow table_setting for: ${uuid}`);
    }

    return cacheSetting;
  }
}
