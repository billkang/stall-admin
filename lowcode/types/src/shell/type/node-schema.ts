import { IPublicTypeCompositeValue } from './composite-value';
import { IPublicTypeNodeData } from './node-data';
import { IPublicTypePropsMap } from './props-map';

/**
 * 搭建基础协议 - 单个组件树节点描述
 */
export interface IPublicTypeNodeSchema {
  id?: string;

  /**
   * 组件名称，必填，首字母大写
   */
  componentName: string;

  /**
   * 组件属性对象
   */
  props?: {
    children?: IPublicTypeNodeData | IPublicTypeNodeData[];
  } & IPublicTypePropsMap;

  leadingComponents?: string;

  /**
   * 渲染条件
   */
  condition?: IPublicTypeCompositeValue;

  /**
   * 循环数据
   */
  loop?: IPublicTypeCompositeValue;

  /**
   * 循环迭代对象、索引名称['item', 'index']
   */
  loopArgs?: [string, string];

  /**
   * 子节点
   */
  children?: IPublicTypeNodeData | IPublicTypeNodeData[];

  /**
   * 是否锁定
   */
  isLocked?: boolean;

  /**
   * 编辑态内部使用
   */
  __ctx?: any;
}
