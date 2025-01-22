import { IPublicTypeFieldExtraProps } from './field-extra-props';
import { IPublicTypeTitleContent } from './title-content';

export interface IPublicTypeFieldConfig extends IPublicTypeFieldExtraProps {
  /**
   * 面板配置隶属于单个 field 还是分株
   */
  type?: 'field' | 'group';

  /**
   * 在quickitor中使用的设置字段的名称
   */
  name?: string | number;

  /**
   * 字段标题
   */
  title?: IPublicTypeTitleContent;

  /**
   * 单个属性的setter配置
   * 当字段主体包含 .type = 'field'
   */
  // setter?: IPublicTypeSetterType | IPublicTypeDynamicSetter;

  /**
   * 当字段主体包含 .type = 'group'
   */
  items?: IPublicTypeFieldConfig[];

  /**
   * 其他配置属性
   */
  extraProps?: IPublicTypeFieldExtraProps;
}
