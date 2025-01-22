import { VNode } from 'vue';

export interface IPublicTypeI18nData {
  type: 'i18n';
  intl?: VNode;
  [key: string]: any;
}
