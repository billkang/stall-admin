import { VNode } from 'vue';
import { IPublicTypeI18nData } from './i18n-data';

export interface IPublicTypeTipConfig {
  className?: string;
  children?: IPublicTypeI18nData | VNode;
  theme?: string;
  direction?: 'top' | 'botton' | 'left' | 'right';
}

export type TipContent = string | IPublicTypeI18nData | VNode | IPublicTypeTipConfig;
