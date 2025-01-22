import { EitherOr } from '../../utils';
import { IPublicTypeComponentSchema } from './component-schema';

export type IPublicTypePackage = EitherOr<
  {
    /**
     * npm 包名
     */
    package: string;

    /**
     * 唯一标识
     */
    id: string;

    /**
     * 版本号
     */
    version: string;

    /**
     * 组件渲染态视图打包后的 CDN url 列表，包括 js 和 css
     */
    urls?: string[];

    /**
     * 组件编辑态视图打包后的 CDN url 列表，包括 js 和 css
     */
    editUrls?: string[];

    /**
     * 作为全局变量引用时的名称，和webpack output.library 字段含义一样，用来定义全局变量名
     */
    library: string;

    /**
     * 标识当前package从其他package的导出形式
     */
    exportMode?: 'functionCall';

    /**
     * 标识当前package时从window上哪个属性导出的
     */
    exportSourceLibrary?: any;

    /**
     * 组件描述导出名字，可以通过 window[exportName] 获取到组件描述的Object内容
     */
    exportName?: string;

    /**
     * 低代码组件schema内容
     */
    schema?: IPublicTypeComponentSchema;
  },
  'package',
  'id'
>;
