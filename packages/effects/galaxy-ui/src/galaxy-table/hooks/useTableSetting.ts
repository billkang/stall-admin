import type { UnwrapNestedRefs } from 'vue';
import { ref, reactive, computed, watch } from 'vue';

// 定义表格文本控制方式的类型
export type TableTextControl = 'wrap' | 'ellipsis';

// 定义表格尺寸的类型
export type TableSize = 'large' | 'small';

// 定义表单数据的类型
export type FormData = Record<string, string | number | boolean | null>;

// 缓存表格设置的全局对象
const CACHE_TABLE_SETTING: Record<string, any> = {};

/**
 * 初始化表格设置
 * @param uuid 表格的唯一标识符
 * @param columns 表格的列配置
 * @param optional 可选的配置项，包括是否可见和宽度
 */
function initTableSetting(
  uuid: string,
  columns: any[],
  optional?: { visible: boolean; width: number },
) {
  // 定义 localStorage 的 key
  let SETTING_SIZE_KEY: string;
  let SETTING_TEXT_CONTROL_KEY: string;
  let SETTING_COLUMNS_KEY: string;

  // 定义表单数据
  let formData: UnwrapNestedRefs<FormData> = {};

  // 定义合并后的列配置
  const mergedColumns = ref<any[]>([]);

  // 定义表格尺寸
  const tableSize = ref<TableSize>('small');

  // 定义文本控制方式
  const textControl = ref<TableTextControl>('wrap');

  // 计算属性：过滤可搜索的列
  const filterableColumns = computed(() =>
    mergedColumns.value.filter(
      (c) =>
        (c.filterable?.componentType || c.filterable?.filters?.length) &&
        ((!!c.visible && c.filterable?.visible !== false) ||
          !!c.filterable?.visible),
    ),
  );

  // 计算属性：过滤输入框搜索的列
  const inputSearchColumns = computed(() =>
    filterableColumns.value.filter(
      (c) => c.filterable?.componentType === 'input',
    ),
  );

  // 监听列配置的变化
  watch(
    () => mergedColumns,
    (newColumns) => {
      // 当列配置变化时，更新表单数据
      newColumns.value
        .filter((c) => c.filterable?.visible !== false) // 过滤掉不可见的列
        .forEach((c) => {
          if (c.dataIndex && !c.visible) {
            formData[c.dataIndex] = null; // 如果列不可见，清空对应的表单数据
          }
        });

      saveSortedColumns(newColumns.value); // 保存排序后的列配置
    },
    {
      deep: true, // 深度监听
    },
  );

  /**
   * 合并用户传入的列配置和缓存的列配置
   * @param columns 用户传入的列配置
   * @returns 合并后的列配置
   */
  function getMergedColumns(columns: any[]) {
    let cachedColumns: any[] | undefined;
    try {
      // 从 localStorage 中读取缓存的列配置
      cachedColumns = JSON.parse(
        window.localStorage.getItem(SETTING_COLUMNS_KEY) || '',
      );
    } catch {}

    let mergedColumns: any[];

    // 如果列长度没有变化，则以缓存的列配置为主
    if (
      cachedColumns &&
      (optional?.visible
        ? cachedColumns.length === columns.length + 1
        : cachedColumns.length === columns.length)
    ) {
      mergedColumns = [
        ...cachedColumns.map((col: any) => {
          if (col.dataIndex === 'optional') {
            return col; // 如果是可选列，直接返回
          }

          const newCol = columns.find(
            (c: any) => c.dataIndex === col.dataIndex,
          );

          const _ellipsis =
            !!newCol?.ellipsis ||
            col.ellipsis ||
            textControl.value === 'ellipsis';
          const _filterable =
            newCol?.filterable ||
            newCol?.filters ||
            newCol?.filterSearch ||
            newCol?.filterType
              ? {
                  ...newCol?.filterable,
                  filters: newCol?.filters || newCol?.filterable?.filters,
                  componentType: !!newCol?.filterSearch
                    ? 'input'
                    : newCol?.filterType || newCol?.filterable?.componentType,
                }
              : col.filterable;

          return {
            visible:
              newCol?.visible !== undefined && newCol?.visible !== null
                ? newCol?.visible
                : true,
            ...col,
            ...newCol,
            ellipsis: _ellipsis,
            filterable: _filterable,
          };
        }),
      ];
    } else {
      // 如果列长度发生变化，则以用户传入的列配置为主
      mergedColumns = [
        ...columns.map((col: any) => {
          const cachedCol = cachedColumns?.find(
            (c: any) => c.dataIndex === col.dataIndex,
          );

          const _ellipsis =
            !!col.ellipsis ||
            cachedCol?.ellipsis ||
            textControl.value === 'ellipsis';
          const _filterable =
            col.filterable || col.filters || col.filterSearch || col.filterType
              ? {
                  ...col.filterable,
                  filters: col.filters || col.filterable?.filters,
                  componentType: !!col.filterSearch
                    ? 'input'
                    : col.filterType || col.filterable?.componentType,
                }
              : cachedCol?.filterable;

          return {
            visible:
              col.visible !== undefined && col.visible !== null
                ? col.visible
                : true,
            ...cachedCol,
            ...col,
            ellipsis: _ellipsis,
            filterable: _filterable,
          };
        }),
      ];

      // 如果有可选列，添加到合并后的列配置中
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

  /**
   * 初始化表格设置
   * @param uuid 表格的唯一标识符
   * @param columns 表格的列配置
   */
  function initSetting(uuid: string, columns: any[]) {
    // 定义 localStorage 的 key
    SETTING_SIZE_KEY = `GTABLE__SETTING_SIZE__${uuid}`;
    SETTING_TEXT_CONTROL_KEY = `GTABLE__SETTING_TEXT_CONTROL__${uuid}`;
    SETTING_COLUMNS_KEY = `GTABLE__SETTING_SORT__${uuid}`;

    // 从 localStorage 中读取表格尺寸和文本控制方式
    tableSize.value =
      (window.localStorage.getItem(SETTING_SIZE_KEY) as TableSize) || 'small';
    textControl.value =
      (window.localStorage.getItem(
        SETTING_TEXT_CONTROL_KEY,
      ) as TableTextControl) || 'wrap';

    // 初始化列配置
    mergedColumns.value = getMergedColumns(columns);

    // 初始化表单数据
    const cols: FormData = {};
    filterableColumns.value.forEach((c) => {
      cols[`${c.dataIndex}`] = null;
    });
    formData = reactive(cols);
  }

  // 初始化表格设置
  initSetting(uuid, columns);

  /**
   * 保存排序后的列配置
   * @param columns 排序后的列配置
   */
  function saveSortedColumns(columns: any[]) {
    window.localStorage.setItem(SETTING_COLUMNS_KEY, JSON.stringify(columns));
  }

  /**
   * 设置文本控制方式
   * @param type 文本控制方式
   */
  function setTextControl(type: TableTextControl) {
    textControl.value = type;
    window.localStorage.setItem(SETTING_TEXT_CONTROL_KEY, type);

    // 更新列配置中的文本控制方式
    mergedColumns.value
      .filter((c) => c.dataIndex !== 'optional')
      .forEach((col) => {
        const original = columns.find((c) => c.dataIndex === col.dataIndex);
        col.ellipsis = !!original?.ellipsis || type === 'ellipsis';
      });
  }

  /**
   * 设置表格尺寸
   * @param size 表格尺寸
   */
  function setTableSize(size: TableSize) {
    tableSize.value = size;
    window.localStorage.setItem(SETTING_SIZE_KEY, size);
  }

  /**
   * 重置表单数据
   * @param newData 可选的新表单数据
   */
  function resetFormData(newData?: FormData) {
    Object.keys(formData).forEach((key) => (formData[key] = null));

    if (newData) {
      Object.keys(newData).forEach((key) => (formData[key] = newData[key]!));
    }
  }

  /**
   * 清空指定字段的表单数据
   * @param key 字段名称
   */
  function cleanFormDataByKey(key: string) {
    Object.keys(formData).forEach((_key) => {
      if (_key === key) {
        formData[key] = null;
      }
    });
  }

  /**
   * 销毁表格设置
   */
  function dispose() {
    CACHE_TABLE_SETTING[uuid] = null;
  }

  /**
   * 处理自定义搜索
   * @param data 搜索数据
   */
  async function handleCustomSearch(data: Record<string, any>) {
    const { key, value } = data;
    const col = filterableColumns.value.find((col) => col.dataIndex === key);
    if (col?.filterable?.customSearch) {
      await col.filterable.customSearch(value, col);
    }
  }

  // 返回表格设置的 API
  return {
    resetFormData,
    cleanFormDataByKey,
    formData,
    filterableColumns,
    inputSearchColumns,
    saveSortedColumns,
    mergedColumns,
    setTableSize,
    tableSize,
    setTextControl,
    textControl,
    dispose,
    handleCustomSearch,
  };
}

/**
 * 使用表格设置
 * @param props 配置项，包括 uuid、columns 和 optional
 * @returns 表格设置的 API
 */
export function useTableSetting(props: {
  uuid: string;
  columns?: any[];
  optional?: { visible: boolean; width: number };
}) {
  const { uuid, columns, optional } = props;
  const cacheSetting = CACHE_TABLE_SETTING[uuid];

  if (columns) {
    if (!cacheSetting) {
      // 如果缓存中没有设置，则初始化并缓存
      CACHE_TABLE_SETTING[uuid] = initTableSetting(uuid, columns, optional);
    }

    return CACHE_TABLE_SETTING[uuid];
  } else {
    if (!cacheSetting) {
      // 如果缓存中没有设置且没有传入 columns，则抛出错误
      throw Error(`unknow table_setting for: ${uuid}`);
    }

    return cacheSetting;
  }
}
