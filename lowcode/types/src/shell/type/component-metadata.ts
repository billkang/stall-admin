import { IPublicTypeComponentSchema } from './component-schema';
import { IPublicTypeConfigure } from './configure';
import { IPublicTypeFieldConfig } from './field-config';
import { IPublicTypeI18nData } from './i18n-data';
import { IPublicTypeIconType } from './icon-type';
import { IPublicTypeNpmInfo } from './npm-info';
import { IPublicTypePropConfig } from './prop-config';
import { IPublicTypeTitleContent } from './title-content';

export interface IPublicTypeComponentMetadata {
  /**
   * 组件 meta 配置
   */
  componentName: string;

  uri?: string;

  /**
   * 标题
   */
  title?: IPublicTypeTitleContent;

  /**
   * svg icon for component
   */
  icon?: IPublicTypeIconType;

  /**
   * 组件标签
   */
  tags?: string[];

  /**
   * 组件描述
   */
  description?: string;

  /**
   * 组件文档链接
   */
  docUrl?: string;

  /**
   * 组件快照
   */
  screenshot?: string;

  /**
   * 组件研发模式
   */
  devMode?: 'proCode' | 'lowCode';

  /**
   * npm 源引入完整描述对象
   */
  npm?: IPublicTypeNpmInfo;

  /**
   * 组件属性信息
   */
  props?: IPublicTypePropConfig[];

  /**
   * 编辑体验增强
   */
  configure?: IPublicTypeFieldConfig[] | IPublicTypeConfigure;

  /**
   * 高级配置
   */
  // advanced?: IPublicTypeAdvanced;

  /**
   *
   */
  schema?: IPublicTypeComponentSchema;

  /**
   * 可用片段
   */
  // snippets?: IPublicTypeSnippet[];

  /**
   * 一级分组
   */
  group?: string | IPublicTypeI18nData;

  /**
   * 二级分组
   */
  category?: string | IPublicTypeI18nData;

  /**
   * 组件优先级排序
   */
  priority?: number;
}
