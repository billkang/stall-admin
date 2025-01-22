import { IPublicTypeComponentMetadata } from './component-metadata';
import { IPublicTypeReference } from './reference';

/**
 * 本地物料描述
 */
export interface IPublicTypeComponentDescription extends IPublicTypeComponentMetadata {
  keywords: string[];

  /**
   * 替代npm字段的升级版本
   */
  reference?: IPublicTypeReference;
}
