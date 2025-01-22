import { IPublicTypeComponentDescription } from './component-description';
import { IPublicTypePackage } from './package';
import { IPublicTypeRemoteComponentDescription } from './remote-component-description';

/**
 * 用于描述组件面板中tab和category
 */
interface IPublicTypeComponentSort {
  /**
   * 用于描述组件面板的tab项及其排序，例如：["精选组件", "原子组件"]
   */
  groupList?: string[];

  /**
   * 组件面板中同一个tab下的不同区间用category区分，category的排序依照categoryList顺序排列
   */
  categoryList?: string[];
}

/**
 * 资产包协议
 */
export interface IPublicTypeAssetsJson {
  /**
   * 资产包协议版本号
   */
  version: string;

  /**
   * 大包列表
   */
  packages?: IPublicTypePackage[];

  /**
   * 所有组件的描述协议列表
   */
  components: Array<IPublicTypeComponentDescription | IPublicTypeRemoteComponentDescription>;

  /**
   * 组件分类列表，用于描述物料面板
   */
  componentList?: any[];

  /**
   * 用于描述组件面板中tab和category
   */
  sort?: IPublicTypeComponentSort;
}
