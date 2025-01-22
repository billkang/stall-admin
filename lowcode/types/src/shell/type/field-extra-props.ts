/**
 * extra props for field
 */
export interface IPublicTypeFieldExtraProps {
  /**
   * 是否必填参数
   */
  isRequired?: boolean;

  /**
   * 设置器属性的默认值
   */
  defaultValue?: any;

  // /**
  //  * 获取字段值
  //  * @param target
  //  * @param fieldValue
  //  * @returns
  //  */
  // getValue?: (target: IPublicModelSettingPropEntry, fieldValue: any) => any;

  // /**
  //  * 设置字段值
  //  * @param target
  //  * @param value
  //  * @returns
  //  */
  // setValue?: (target: IPublicModelSettingPropEntry, value: any) => void;

  // /**
  //  * 字段条件显示，并不总是设置为真
  //  * @param target
  //  * @returns
  //  */
  // condition?: (target: IPublicModelSettingPropEntry) => boolean;

  // /**
  //  * 发生变化时自动运行
  //  * @param target
  //  * @returns
  //  */
  // autorun?: (target: IPublicModelSettingPropEntry) => void;

  // /**
  //  * 这个字段是一个虚拟字段，不保存到schema
  //  * @param target
  //  * @returns
  //  */
  // virtual?: (target: IPublicModelSettingPropEntry) => boolean;

  /**
   * 手风琴，默认折叠
   */
  defaultCollapsed?: boolean;

  /**
   * 重要字段
   */
  important?: boolean;

  /**
   * 内部使用
   */
  forceInline?: number;

  /**
   * 是否支持变量配置
   */
  supportVariable?: boolean;

  /**
   * 兼容视觉显示
   */
  display?: 'accordion' | 'inline' | 'block' | 'plain' | 'popup' | 'entry';

  /**
   * onChange 事件
   * @returns
   */
  onChange?: (value: any, field: any) => void;
}
