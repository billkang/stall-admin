import { Asset, AssetBundle, AssetItem, AssetLevel, AssetList, AssetType } from '@stall-lowcode/types';
import { createDefer } from './create-defer';
import { evaluate, load } from './script';

export function isAssetItem(obj: Asset): obj is AssetItem {
  if (typeof obj !== 'string' && !Array.isArray(obj)) {
    return obj && !!obj.type;
  }

  return false;
}

export function isAssetBundle(obj: Asset): obj is AssetBundle {
  if (typeof obj !== 'string' && !Array.isArray(obj)) {
    return obj && obj?.type === AssetType.Bundle;
  }

  return false;
}

/**
 * 判断是否是 css url
 */
export function isCSSUrl(url: string): boolean {
  return /\.css(\?.*)?$/.test(url);
}

/**
 * 创建 AssetItem 对象
 * @param type
 * @param content
 * @param level
 * @param id
 * @returns
 */
export function createAssetItem(type: AssetType, content?: string, level?: AssetLevel, id?: string): AssetItem {
  return {
    type,
    content,
    level,
    id,
  };
}

type ParsedAssetItem = Record<AssetLevel, AssetItem[]>;

/**
 * 解析资源
 * @param scripts
 * @param styles
 * @param asset
 * @param level
 */
function parseAsset(scripts: ParsedAssetItem, styles: ParsedAssetItem, asset: Asset, level?: AssetLevel) {
  if (Array.isArray(asset)) {
    return parseAssetList(scripts, styles, asset, level);
  }

  if (isAssetBundle(asset)) {
    if (asset.assets) {
      if (Array.isArray(asset.assets)) {
        parseAssetList(scripts, styles, asset.assets, asset.level || level);
      } else {
        parseAsset(scripts, styles, asset.assets, asset.level || level);
      }
      return;
    }
    return;
  }

  if (!isAssetItem(asset)) {
    asset = createAssetItem(isCSSUrl(asset) ? AssetType.CSSUrl : AssetType.JSUrl, asset, level);
  }

  let lv = asset.level || level;
  if (!lv || !AssetLevel[lv]) {
    lv = AssetLevel.App;
  }

  asset.level = lv;
  if (asset.type === AssetType.CSSUrl || asset.type === AssetType.CSSText) {
    styles[lv].push(asset);
  } else {
    scripts[lv].push(asset);
  }
}

/**
 * 解析资源列表
 * @param scripts
 * @param styles
 * @param assets
 * @param level
 */
function parseAssetList(scripts: ParsedAssetItem, styles: ParsedAssetItem, assets: AssetList, level?: AssetLevel) {
  for (const asset of assets) {
    parseAsset(scripts, styles, asset, level);
  }
}

/**
 * 样式表操作类
 */
export class StylePoint {
  private lastContent: string | undefined;
  private lastUrl: string | undefined;
  private placeholder: Element | Text;

  readonly level: number;
  readonly id: string | undefined;

  constructor(level: number, id?: string) {
    this.level = level;
    if (id) {
      this.id = id;
    }

    let placeholder: Element | Text | null = null;
    if (id) {
      placeholder = document.head.querySelector(`style[data-id="${id}"]`);
    }
    if (!placeholder) {
      placeholder = document.createTextNode('');

      const meta: Element | null = document.head.querySelector(`meta[level="${level}"]`);
      if (meta) {
        document.head.insertBefore(placeholder, meta);
      } else {
        document.head.appendChild(placeholder);
      }
    }
    this.placeholder = placeholder;
  }

  /**
   * 添加css文本内容到页面
   * @param content
   * @returns
   */
  applyText(content: string) {
    if (this.lastContent === content) {
      return;
    }

    this.lastContent = content;
    this.lastUrl = undefined;

    const element = document.createElement('style');
    element.setAttribute('type', 'text/css');
    if (this.id) {
      element.setAttribute('data-id', this.id);
    }
    element.appendChild(document.createTextNode(content));
    document.head.insertBefore(
      element,
      this.placeholder.parentNode === document.head ? this.placeholder.nextSibling : null,
    );
    document.head.removeChild(this.placeholder);
    this.placeholder = element;
  }

  /**
   * 添加css url到页面
   * @param url
   */
  applyUrl(url: string) {
    if (this.lastUrl === url) {
      return;
    }

    this.lastContent = undefined;
    this.lastUrl = url;

    const d = createDefer();
    function onload(e: any) {
      element.onload = null;
      element.onerror = null;

      if (e.type === 'load') {
        d.resolve();
      } else {
        d.reject();
      }
    }

    const element = document.createElement('link');
    element.onload = onload;
    element.onerror = onload;
    element.href = url;
    element.rel = 'stylesheet';
    if (this.id) {
      element.setAttribute('data-id', this.id);
    }
    document.head.insertBefore(
      element,
      this.placeholder.parentNode === document.head ? this.placeholder.nextSibling : null,
    );
    document.head.removeChild(this.placeholder);
    this.placeholder = element;

    return d.promise();
  }
}

/**
 * 资源加载器
 */
export class AssetLoader {
  private stylePoints = new Map<string, StylePoint>();

  async load(asset: Asset) {
    const scripts: ParsedAssetItem = {
      [AssetLevel.Environment]: [],
      [AssetLevel.Library]: [],
      [AssetLevel.Theme]: [],
      [AssetLevel.Runtime]: [],
      [AssetLevel.Components]: [],
      [AssetLevel.App]: [],
    };
    const styles: ParsedAssetItem = {
      [AssetLevel.Environment]: [],
      [AssetLevel.Library]: [],
      [AssetLevel.Theme]: [],
      [AssetLevel.Runtime]: [],
      [AssetLevel.Components]: [],
      [AssetLevel.App]: [],
    };

    parseAsset(scripts, styles, asset);

    const styleQueue: AssetItem[] = styles[AssetLevel.Environment].concat(
      styles[AssetLevel.Library],
      styles[AssetLevel.Theme],
      styles[AssetLevel.Runtime],
      styles[AssetLevel.App],
    );
    const scriptQueue: AssetItem[] = scripts[AssetLevel.Environment].concat(
      scripts[AssetLevel.Library],
      scripts[AssetLevel.Theme],
      scripts[AssetLevel.Runtime],
      scripts[AssetLevel.App],
    );

    await Promise.all(
      styleQueue.map(({ content, level, type, id }) => this.loadStyle(content, level!, type === AssetType.CSSUrl, id)),
    );

    await Promise.all(scriptQueue.map(({ content, type }) => this.loadScript(content, type === AssetType.JSUrl)));
  }

  /**
   * 加载样式
   * @param content
   * @param level
   * @param isUrl
   * @param id
   */
  private loadStyle(content: string | undefined, level: AssetLevel, isUrl?: boolean, id?: string) {
    if (!content) {
      return;
    }

    let point: StylePoint | undefined;
    if (id) {
      point = this.stylePoints.get(id);

      if (!point) {
        point = new StylePoint(level, id);
        this.stylePoints.set(id, point);
      }
    } else {
      point = new StylePoint(level);
    }

    return isUrl ? point.applyUrl(content) : point.applyText(content);
  }

  /**
   * 加载script
   * @param content
   * @param isUrl
   */
  private loadScript(content: string | undefined, isUrl?: boolean) {
    if (!content) {
      return;
    }

    return isUrl ? load(content) : evaluate(content);
  }
}
