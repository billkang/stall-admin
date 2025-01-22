import { IPublicTypeComponentMetadata } from './component-metadata';
import { IPublicTypeReference } from './reference';

/**
 * 远程物料描述
 */
export interface IPublicTypeRemoteComponentDescription extends IPublicTypeComponentMetadata {
  /**
   * 组件描述导出名字，可以通过 window[exportName] 获取到组件描述的object内容
   */
  exportName?: string;

  /**
   * 组件描述的资源链接
   */
  url?: string;

  /**
   * 组件库的npm信息
   */
  package?: {
    npm?: string;
  };

  /**
   * 替代npm字段的升级版本
   */
  reference?: IPublicTypeReference;
}
