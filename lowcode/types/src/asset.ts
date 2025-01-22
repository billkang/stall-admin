export enum AssetLevel {
  // 环境依赖库 比如 react
  Environment = 1,
  // 基础类库，比如 lodash
  Library = 2,
  // 主题
  Theme = 3,
  // 运行时
  Runtime = 4,
  // 业务组件
  Components = 5,
  // 应用 & 页面
  App = 6,
}

export type URL = string;

export enum AssetType {
  JSUrl = 'jsUrl',
  JSText = 'jsText',
  CSSUrl = 'cssUrl',
  CSSText = 'cssText',
  Bundle = 'bundle',
}

export interface AssetItem {
  type: AssetType;
  content?: string;
  device?: string;
  level?: AssetLevel;
  id?: string;
}

export type AssetList = Array<Asset>;

export interface AssetBundle {
  type: AssetType.Bundle;
  level?: AssetLevel;
  assets?: Asset | AssetList;
}

export type Asset = AssetList | AssetBundle | AssetItem | URL;
