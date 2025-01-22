import { CommonEffectHook, SandBoxAdapter, WithSandBoxInterface } from '../../micro-widget-types';
import globalEnv from '../../libs/global-env';
import Adapter from '../adapter';
import { patchDocument } from './document';
import { patchWindow } from './window';

export interface MicroWidgetWindowDataType {
  __MICRO_WIDGET_WINDOW__: Window;
  rawWindow: Window;
  rawDocument: Document;
}

export type MicroWidgetWindowType = Window & MicroWidgetWindowDataType;
export type ProxyWindow = WindowProxy & MicroWidgetWindowDataType;

export default class WithSandBox implements WithSandBoxInterface {
  static activeCount = 0;

  private active = false;
  private windowEffect: CommonEffectHook;
  private documentEffect: CommonEffectHook;

  public adapter: SandBoxAdapter;
  public scopeProperties: PropertyKey[] = [];
  public escapeProperties: PropertyKey[] = [];
  public escapeKeys = new Set<PropertyKey>();
  public injectedKeys = new Set<PropertyKey>();
  public proxyWindow!: ProxyWindow;
  public microWidgetWindow = new EventTarget() as MicroWidgetWindowType;

  constructor(widgetName: string) {
    this.adapter = new Adapter();

    this.getSpecialProperties();

    this.windowEffect = patchWindow(widgetName, this.microWidgetWindow, this);
    this.documentEffect = patchDocument(widgetName, this.microWidgetWindow, this);

    this.initStaticGlobalKeys(this.microWidgetWindow);
  }

  private getSpecialProperties(): void {
    this.scopeProperties = this.scopeProperties.concat(this.adapter.staticScopeProperties);
  }

  private initStaticGlobalKeys(microWidgetWindow: MicroWidgetWindowType): void {
    microWidgetWindow.rawWindow = globalEnv.rawWindow;
    microWidgetWindow.rawDocument = globalEnv.rawDocument;
    microWidgetWindow.__MICRO_WIDGET_WINDOW__ = microWidgetWindow;
  }

  public start(): void {
    if (this.active) return;

    this.active = true;
  }
}
