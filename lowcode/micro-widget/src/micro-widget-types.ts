export type AttrType = string | null;

export type WidgetName = string;

export type Func = (...rest: any[]) => void;

export type SourceAddress = string;

export type AttrsType = Map<string, string>;

export type MicroWidgetWindowType = Window & any;

export interface SandBoxAdapter {
  escapeSetterKeyList: PropertyKey[];
  staticEscapeProperties: PropertyKey[];
  staticScopeProperties: PropertyKey[];
}

export interface WithSandBoxInterface {
  adapter: SandBoxAdapter;
  proxyWindow: WindowProxy;
  microWidgetWindow: Window;
  scopeProperties: PropertyKey[];
  escapeProperties: PropertyKey[];
  injectedKeys: Set<PropertyKey>;
  escapeKeys: Set<PropertyKey>;
}

export interface CommonEffectHook {
  reset(): void;
  record(): void;
  rebuild(): void;
  release(clearTimer?: boolean): void;
}

export type MicroEventListener = EventListenerOrEventListenerObject & Record<string, any>;

export type FiberTasks = Array<() => Promise<void>> | null;

export interface StyleSourceInfo {
  code: string;
  widgetSpace: Record<
    string,
    {
      parsedCode?: string;
      prefix?: string;
    }
  >;
}

export interface ScriptSourceInfo {
  code: string;
  widgetSpace: Record<
    string,
    {
      parsedCode?: string;
      parsedFunction?: Function | null;
      sandboxType?: 'with' | 'iframe';
    }
  >;
}

export interface RequestIdleCallbackOptions {
  timeout: number;
}

export interface RequestIdleCallbackInfo {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
}

export interface globalAssetsType {
  js?: string[];
  css?: string[];
}

export interface MicroWidgetConfig {
  shadowDom?: boolean;
  destroy?: boolean;
  iframe?: boolean;
  fiber?: boolean;
  prefetchLevel?: number;
  prefetchDelay?: number;
}

export interface OptionsType extends MicroWidgetConfig {
  tagName?: string;
  globalAssets?: globalAssetsType;
  excludeAssetFilter?: (assetUrl: string) => boolean;
  getRootElementParentNode?: (node: Node, widgetName: WidgetName) => void;
}

export interface MicroWidgetBaseType {
  tagName: string;
  options: OptionsType;
  start(options?: OptionsType): void;
}

export type Framework = 'vue' | 'vue2' | 'vue3';

export interface SourceParamType {
  styles: string[];
  scripts: Array<{ url: string; type: 'iife' | 'umd' } | string>;
}

export interface OuterComponentDesc {
  library: string;
  framework: Framework;
  source: SourceParamType;
  exportName: string;
  destructuring: boolean;
}

export interface OuterComponentInfo extends OuterComponentDesc {
  props: Record<string, string>;
  children: any[] | string | null;
}

export interface MicroWidgetElementType {
  widgetName: AttrType;
  componentInfo: OuterComponentInfo;

  connectedCallback(): void;

  disconnectedCallback(): void;

  getDisposeResult<T extends OptionsType>(name: T): boolean;

  mount(widget: WidgetInterface): void;
}

export interface MicroWidgetElementTagNameMap extends HTMLElementTagNameMap {
  'micro-widget': any;
}

export interface MountParam {
  container: HTMLElement | ShadowRoot;
  fiber: boolean;
}

export interface UnmountParam {
  unmountcb?: CallableFunction;
}

export interface WidgetInterface extends Pick<ParentNode, 'querySelector' | 'querySelectorAll'> {
  sandBox: WithSandBoxInterface | null | any;

  name: string;
  container: HTMLElement | ShadowRoot | null;
  iframe: boolean;
  fiber: boolean;
  componentInfo: OuterComponentInfo;

  loadSourceCode(): void;

  onLoad(): void;

  onLoadError(e: Error): void;

  mount(mountParam: MountParam): void;

  unmount(unmountParam: UnmountParam): void;

  onerror(e: Error): void;

  getState(): string;

  isUnmounted(): boolean;
}

export interface MicroLocation extends Location, URL {
  fullPath: string;
  [key: string]: any;
}

export interface TimerInfo {
  handler: TimerHandler;
  timeout?: number;
  args: any[];
}
