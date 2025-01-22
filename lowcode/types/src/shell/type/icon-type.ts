import { VueElement } from 'vue';

export interface IPublicTypeIconConfig {
  type: string;
  size?: number | 'small' | 'xxs' | 'xs' | 'medium' | 'large' | 'xl' | 'xxl' | 'xxxl' | 'inherit';
  className?: string;
}

export type IPublicTypeIconType = string | VueElement | IPublicTypeIconConfig;
