import { IPublicTypeCompositeValue } from './composite-value';
import { IPublicTypeNodeData } from './node-data';

/**
 * 变量表达式
 * 表达式内通过this对象获取上下文
 */
export interface IPublicTypeJSExpression {
  type: 'JSExpression';

  /**
   * 表达式字符串
   */
  value: string;

  /**
   * 模拟值
   */
  mock?: any;

  /**
   * 源码
   */
  compiled?: string;
}

/**
 * 事件函数类型
 * 保留与原组件属性、生命周期一致的输入参数，并给所有事件函数 binding 统一一致的上下文（当前组件所在容器结构的 this 对象）
 */
export interface IPublicTypeJSFunction {
  type: 'JSFunction';

  /**
   * 函数定义或函数表达式
   */
  value: string;

  /**
   * 模拟值
   */
  mock?: any;

  /**
   * 源码
   */
  compiled?: string;

  /**
   * 额外扩展属性，如 extType、events
   */
  [key: string]: any;
}

/**
 * slot 函数类型
 */
export interface IPublicTypeJSSlot {
  type: 'JSSlot';

  title?: string;

  id?: string;

  name?: string;

  /**
   * 函数入参
   * 其子节点可以通过 this[参数名] 来获取对应参数
   */
  params?: string[];

  /**
   * 具体值
   */
  value?: IPublicTypeNodeData[] | IPublicTypeNodeData;
}

export type IPublicTypeJSONArray = IPublicTypeCompositeValue[];

export interface IPublicTypeJSONObject {
  [key: string]: IPublicTypeJSONValue;
}

/**
 * JSON 基本类型
 */
export type IPublicTypeJSONValue =
  | boolean
  | string
  | number
  | null
  | undefined
  | IPublicTypeJSONArray
  | IPublicTypeJSONObject;

export type IPublicTypeCompositeArray = IPublicTypeCompositeValue[];

export interface IPublicTypeCompositeObject<T = IPublicTypeCompositeValue> {
  [key: string]: IPublicTypeCompositeValue | T;
}
