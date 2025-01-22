import { IPublicTypeCompositeValue } from './composite-value';
import { InterpretDataSource } from './datasource';
import { IPublicTypeNodeSchema } from './node-schema';
import { IPublicTypeCompositeObject, IPublicTypeJSExpression, IPublicTypeJSFunction } from './value-type';

export interface IPublicTypeContainerSchema extends IPublicTypeNodeSchema {
  /**
   * Block | Page | Component
   */
  componentName: string;

  /**
   * 文件名称
   */
  fileName: string;

  meta?: Record<string, unknown>;

  /**
   * 容器初始数据
   */
  state?: {
    [key: string]: IPublicTypeCompositeValue;
  };

  /**
   * 自定义方法设置
   */
  methods?: {
    [key: string]: IPublicTypeJSExpression | IPublicTypeCompositeValue;
  };

  /**
   * 生命周期对象
   */
  lifeCycles?: {
    [key: string]: IPublicTypeJSExpression | IPublicTypeJSFunction;
  };

  /**
   * 样式文件
   */
  css?: string;

  /**
   * 异步数据源配置
   */
  dataSource?: InterpretDataSource;

  /**
   * 低代码业务组件默认属性
   */
  defaultProps?: IPublicTypeCompositeObject;
}
