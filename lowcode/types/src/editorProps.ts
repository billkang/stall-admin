export enum VisualEditorPropsType {
  /** 输入框 */
  input = 'input',
  /** 数字输入框 */
  inputNumber = 'InputNumber',
  /** 颜色选择器 */
  color = 'color',
  /** 下拉选择器 */
  select = 'select',
  /** 表格 */
  table = 'table',
  /** 开关 */
  switch = 'switch',
  /** 模型绑定选择器 */
  modelBind = 'ModelBind',
  /** 可拖拽项 */
  crossSortable = 'CrossSortable',
}

export type VisualEditorProps = {
  type: VisualEditorPropsType;
  /** 表单项标签名称 */
  label: string;
  /** 表单项提示说明 */
  tips?: string;
  /** 表单域标签的位置 */
  labelPosition?: string;
  /** 表单项默认值 */
  defaultValue?: any;
} & {
  /** 可选项 */
  options?: VisualEditorSelectOptions;
  /** 是否可以多选 */
  multiple?: boolean;
  /** 项属性配置 */
  showItemPropsConfig?: boolean;
} & {
  max?: number;
  min?: number;
} & {
  table?: VisualEditorTableOption;
};

/*---------------------------------------modelBind-------------------------------------------*/
export interface EditorModelBindProp {
  label: string;
  defaultValue?: any;
  tips?: string;
}

/*---------------------------------------switch-------------------------------------------*/
export interface EditorSwitchProp {
  label: string;
  defaultValue?: boolean;
  tips?: string;
}

/*---------------------------------------input-------------------------------------------*/

export interface EditorInputProp {
  label: string;
  defaultValue?: any;
  tips?: string;
}

/*---------------------------------------InputNumber -------------------------------------------*/

export interface EditorInputNumberProp {
  label: string;
  defaultValue?: any;
  tips?: string;
  max?: number;
  min?: number;
}

/*---------------------------------------color-------------------------------------------*/

export interface EditorColorProp {
  label: string;
  defaultValue?: string;
}

/*---------------------------------------select-------------------------------------------*/

export type VisualEditorSelectOptions = {
  label: string;
  value: string | number | boolean | object;
  [prop: string]: any;
}[];

export interface EditorSelectProp {
  label: string;
  options: VisualEditorSelectOptions;
  defaultValue?: any;
  multiple?: boolean;
  tips?: string;
}

/*---------------------------------------table-------------------------------------------*/

export type VisualEditorTableOption = {
  options: {
    label: string; // 列显示文本
    field: string; // 列绑定的字段
  }[];
  showKey: string;
};

export interface EditorTableProp {
  label: string;
  option: VisualEditorTableOption;
  defaultValue?: { label: string; value: string }[];
}

/*---------------------------------------CrossSortableOptions-------------------------------------------*/

export interface EditorCrossSortableProp {
  label: string;
  labelPosition: 'top' | '';
  multiple?: boolean;
  showItemPropsConfig?: boolean;
  defaultValue?: string[] | VisualEditorSelectOptions;
}
