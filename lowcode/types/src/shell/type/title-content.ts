import { VNode, VueElement } from 'vue';
import { IPublicTypeI18nData } from './i18n-data';
import { TipContent } from './tip-content';
import { IPublicTypeIconType } from './icon-type';

/**
 * 描述 props 的 setter title
 */
export interface IPublicTypeTitleConfig {
  /**
   * 文字描述
   */
  label?: IPublicTypeI18nData | VNode;

  /**
   * hover 后展示内容
   */
  tip?: TipContent;

  /**
   * 文档链接
   */
  docUrl?: string;

  /**
   * 图标
   */
  icon?: IPublicTypeIconType;

  /**
   * css 类
   */
  className?: string;
}

export type IPublicTypeTitleContent = string | IPublicTypeI18nData | VueElement | IPublicTypeTitleConfig;
