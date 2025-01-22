```yaml
meta:
  type: 组件
  category: 数据展示
title: 复杂表格 GalaxyTable
description: 用于数据收集展示、分析整理、操作处理。
```

## API

### `<galaxy-table>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|uuid|表格唯一标识|`string`|-||
|label|表格文字标识，pagination-total会使用|`string`|||
|row-key|表格行 `key` 的取值字段|`string`|`'key'`||
|columns|表格的列描述信息|`TableColumnData[]`|`[]`||
|data-source|表格的数据|`TableData[]`|`[]`||
|loading|是否为加载中状态|`boolean`|`false`||
|virtual-list-props|传递虚拟列表属性，传入此参数以开启虚拟滚动 [VirtualListProps](#VirtualListProps)|`VirtualListProps`|`-`|0.0.32|
|draggable|表格拖拽排序的配置 [TableDraggable](#TableDraggable) |`TableDraggable`|`-`|0.0.32|
|load-more|数据懒加载函数，传入时开启懒加载功能|`(record: TableData, done: (children?: TableData[]) => void) => void`|`-`|0.0.40|
|show-checked-all|是否显示全选选择器|`boolean`|`true`||
|show-row-selection|是否显示行选择器|`boolean`|`true`||
|rowSelectionType|选择器类型|`checkbox\|radio`|`checkbox`|0.0.89|
|permission|权限控制  [TablePermission](#TablePermission)|`TablePermission`|`{ filter: true, edit: true, delete: true }`|0.0.34|
|text-replacement|替换文字  [TableTextReplacement](#TableTextReplacement)|`TableTextReplacement`|-|0.0.44|
|switch-confirm|默认弹框开关  [TableSwitchConfirm](#TableSwitchConfirm)|`TableSwitchConfirm`|-|0.0.50|
|pagination|分页查询  [TablePagination](#TablePagination)|`TablePagination`|`{ total: 0, showTotal: false }`|0.0.54|
|row-class|表格行元素的类名|`string\| any[]\| Record<string, any>\| ((record: TableData, rowIndex: number) => any)`|`-`|0.0.59|
|span-method|单元格合并方法（索引从数据项开始计数）|`(data: {  record: TableData;  column: TableColumnData \| TableOperationColumn;  rowIndex: number;  columnIndex: number;}) => { rowspan?: number; colspan?: number } \| void`|`-`|0.0.64|
|expandable|表格的展开行配置|`TableExpandable`|`-`|0.0.83|
|expanded-keys|显示的展开行、子树（受控模式）优先于 `expandable`|`(string \| number)[]`|`-`|0.0.83|
|default-expanded-keys|默认显示的展开行、子树（非受控模式）优先于 `expandable`|`(string \| number)[]`|`-`|0.0.83|
|page-position|分页位置|`'br' \| 'tr'`|`br`|0.0.89|
|default-selected-keys|默认已选择的行（非受控模式）优先于 `rowSelection`|`(string \| number)[]`|`-`|0.0.90|
|scroll|表格的滚动属性配置。|`{  x?: number \| string;  y?: number \| string;  minWidth?: number \| string;  maxHeight?: number \| string;}`|`-`|0.0.91|
|maxSelectedKeysCount|最大允许选中行数|`number`|`50`|0.0.91|
|stripe|是否开启斑马纹效果|`boolean`|`false`|0.0.94|
|optional|控制操作列|`{ visible: boolean; width: number }`|`{ visible: true; width: 120 }`|0.0.95|
|filter|控制搜索栏|`{ selector: boolean; moreFilter: boolean; myFilter: boolean; inputSearch: boolean; summary: boolean; }`|`{ selector: true, moreFilter: true, myFilter: true, inputSearch: true, summary: true }`|0.0.100|
|multiMode|多模式|`boolean`|`false`|0.0.118|

### `<galaxy-table>` Events

|事件名|描述|参数|版本|
|---|---|---|:---|
|change|表格数据发生变化时触发|data: `TableData[]`<br>extra: `TableChangeExtra`<br>currentData: `TableData[]`|0.0.32|
|selection-change|点击行选择器时触发|rowKeys: `string \| number[]`<br>rowKey: `string \| number`<br>record: `TableData`||
|select|点击行选择器时触发|rowKeys: `string \| number[]`<br>rowKey: `string \| number`<br>record: `TableData`|0.0.109|
|select-all|点击全选选择器时触发|checked: `boolean`|0.0.109|
|search|查询表格时触发|data:`TableFilterData[]`, extraData: `object`|0.0.71|
|edit|编辑表格某行数据时触发|data:`TableData[]`||
|delete|删除表格某行数据时触发|data:`TableData[]`||
|delete-batch|批量删除表格某行数据时触发|rowKeys: `string \| number[]`||

### `<galaxy-table>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|filter-before|过滤条前置插槽|-|0.0.71|
|filter-after|过滤条后置插槽|-|0.0.71|
|header-btns-before|表头操作【删除】左侧内容|-||
|header-btns-after|表头操作【删除】右侧内容|column: `TableColumnData`||
|table-action-before|表格操作左侧内容|-||
|table-action-after|表格操作右侧内容|column: `TableColumnData`||
|pagination-total|分页组件总数|total|0.0.78|
|card-item|卡片模式，卡片内容|record, index|0.0.118|

### TableData

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|key|数据行的key|`string`|`-`||
|expand|扩展行内容|`string \| RenderFunction`|`-`||
|children|子数据|`TableData[]`|`-`||
|disabled|是否禁用行选择器|`boolean`|`false`||
|isLeaf|是否是叶子节点|`boolean`|`false`||

### TableColumnData

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|dataIndex|列信息的标识，对应 `TableData` 中的数据|`string`|`-`||
|title|列标题|`string \| RenderFunction`|`-`||
|width|列宽度|`number`|`-`||
|align|对齐方向|`'left' \| 'center' \| 'right'`|`-`||
|fixed|固定位置|`'left' \| 'right'`|`-`||
|ellipsis|是否显示省略号|`boolean`|`false`||
|tooltip|是否在显示省略号时显示文本提示。可填入 tooltip 组件属性|`boolean \| Record<string, any>`|`-`||
|sortable|排序相关选项|`TableSortable`|`-`||
|filterable|过滤相关选项|`TableFilterable`|`-`||
|children|表头子数据，用于表头分组|`TableColumnData[]`|`-`||
|cellClass|自定义单元格类名|`ClassName`|`-`||
|headerCellClass|自定义表头单元格类名|`ClassName`|`-`||
|bodyCellClass|自定义内容单元格类名|`ClassName \| ((record: TableData) => ClassName)`|`-`||
|summaryCellClass|自定义总结栏单元格类名|`ClassName \| ((record: TableData) => ClassName)`|`-`||
|cellStyle|自定义单元格样式|`CSSProperties`|`-`||
|headerCellStyle|自定义表头单元格样式|`CSSProperties`|`-`||
|bodyCellStyle|自定义内容单元格样式|`CSSProperties \| ((record: TableData) => CSSProperties)`|`-`||
|summaryCellStyle|自定义总结栏单元格样式|`CSSProperties \| ((record: TableData) => CSSProperties)`|`-`||
|render|自定义列单元格的渲染|`(data: {    record: TableData;    column: TableColumnData;    rowIndex: number;  }) => VNodeChild`|`-`||
|format|通用格式化|`datetime`||0.0.82|
|slotName|设置当前列的渲染插槽的名字。插槽参数同 #cell|`string`|`-`||
|titleSlotName|设置当前列的标题的渲染插槽的名字|`string`|`-`||
|extra|用户自定义字段|`object`|`-`|0.0.71|
|visible|是否可见，将设置为false，强制不可见|`boolean`|`true`|0.0.85|

### TableSortable

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|sortDirections|支持的排序方向|`('ascend' \| 'descend')[]`|`-`|
|sortOrder|排序方向|`'ascend' \| 'descend' \| ''`|`-`|
|defaultSortOrder|默认排序方向（非受控模式）|`'ascend' \| 'descend' \| ''`|`-`|

### TableFilterData

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|text|筛选数据选项的内容|`string \| RenderFunction`|`-`|
|value|筛选数据选项的值|`string`|`-`|


### TableFilterable

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|filters|筛选数据|`TableFilterData[]`|`-`||
|multiple|是否支持多选|`boolean`|`false`||
|componentType|默认筛选项|`select \| input \| date-picker \| time-picker \| rang-picker`|`select`||
|visible|筛选条件是否可见，设置为true，强制显示；设置为false，强制不显示；不设置，依赖于column的visible属性|`undefined \| boolean`|`undefined`|0.0.85|
|customSearch| select组件multiple设置为true的时候，用户可以使用该函数实现远程查询的功能 |`(val: string, column: TableColumnData) => void;`|`undefined`|0.0.85|
|render| 自定义JSX渲染 |`jsx 函数`|`undefined`|0.0.87|

## Type

### TableDraggable

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|type|拖拽类型|`'row' \| 'handle'`|`-`|
|title|列标题|`string`|`-`|
|width|列宽度|`number`|`-`|
|fixed|是否固定|`boolean`|`false`|


### TableChangeExtra

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|type|触发类型|`'pagination' \| 'sorter' \| 'filter' \| 'drag'`|`-`|
|page|页码|`number`|`-`|
|pageSize|每页数据数|`number`|`-`|
|sorter|排序信息|`Sorter`|`-`|
|filters|筛选信息|`Filters`|`-`|
|dragDetail|拖拽信息|`TableDragDetail`|`-`|


### VirtualListProps

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|height|可视区域高度|`number \| string`|`-`||
|threshold|开启虚拟滚动的元素数量阈值，当数据数量小于阈值时不会开启虚拟滚动。|`number`|`-`||
|fixedSize|元素高度是否是固定的。|`boolean`|`false`||
|estimatedSize|元素高度不固定时的预估高度。|`number`|`-`||
|buffer|视口边界外提前挂载的元素数量。|`number`|`10`||

### TablePermission

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|filter|是否显示过滤搜索|boolean|true||
|edit|是否可以编辑|`boolean \| Function`|true|0.0.43|
|delete|是否可以删除数据|`boolean \| Function`|true|0.0.43|

### TableTextReplacement

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|btn.edit|编辑按钮文字|string|-|0.0.44|
|btn.delete|删除按钮文字|string|-|0.0.44|
|btn.deleteBatch|删除按钮文字|string|-|0.0.53|

### TableSwitchConfirm

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|delete|行内删除按钮弹框|string|true|0.0.50|
|deleteBatch|批量删除按钮弹框|boolean|true|0.0.50|

### TablePagination

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|total|总数|number|0|0.0.54|
|show-total|是否显示数据总数|boolean|false|0.0.54|


### TableDragDetail

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|sourcePath|拖拽源层级路径|array|-|0.0.70|
|targetPath|目标源层级路径|array|-|0.0.70|
|sourceItems|拖拽源信息|`Array<Record<string, unknown>>`|-|0.0.70|
|targetParent|目标父节点|`Record<string, unknown>`|-|0.0.70|
|previousTargetItem|目标前序节点|`Record<string, unknown>`|-|0.0.70|
|afterTargetItem|目标后序节点|`Record<string, unknown>`|-|0.0.70|
|targetOrder|目标序列|number|-|0.0.70|


## useTableFetchData

用于简化页面数据请求

``` vue
const {
  loading,
  dataSource,
  pagination,
  fetchData,
} = useTableFetchData(request.post(xxx))
```
