import type { OuterComponentInfo, WidgetInterface } from './micro-widget-types';
import { WIDGET_STATUS } from './constants';
import globalEnv from './libs/global-env';
import { getRootContainer, logError, pureCreateElement } from './libs/utils';
import WithSandBox from './sandbox/with';
import { execScripts, fetchScripts } from './source/scripts';
import { fetchStyles } from './source/styles';

export const widgetInstanceMap = new Map<string, WidgetInterface>();

export interface CreateWidgetParam {
  name: string;
  componentInfo: OuterComponentInfo;
  container?: HTMLElement | ShadowRoot;
  iframe?: boolean;
}

export function isIframeSandbox(widgetName: string): boolean {
  return widgetInstanceMap.get(widgetName)?.iframe ?? false;
}

export default class CreateWidget implements WidgetInterface {
  private state: string = WIDGET_STATUS.CREATED;
  private loadSourceLevel: -1 | 0 | 1 | 2 = 0;
  public sandBox: WithSandBox | null = null;

  public name: string;
  public componentInfo: OuterComponentInfo;
  public fiber = true;
  public container: HTMLElement | ShadowRoot | null;
  public iframe: boolean;

  constructor({ name, componentInfo, container, iframe }: CreateWidgetParam) {
    widgetInstanceMap.set(name, this);

    this.name = name;
    this.componentInfo = componentInfo;
    this.container = container ?? null;
    this.iframe = iframe ?? false;

    this.loadSourceCode();
    this.createSandbox();
  }
  onerror(e: Error): void {
    logError(e.message, this.name);
  }

  getState(): string {
    return this.state;
  }

  public loadSourceCode(): void {
    this.setState(WIDGET_STATUS.LOADING);

    const { styles, scripts } = this.componentInfo.source;

    if (styles.length) {
      fetchStyles(this);
    } else {
      this.onLoad();
    }

    if (scripts.length) {
      fetchScripts(this);
    } else {
      logError('create-widget error: must supply script address!');
    }
  }

  private createSandbox(): void {
    if (!this.sandBox) {
      this.sandBox = new WithSandBox(this.name);
    }
  }

  public querySelector(selector: string): Node | null {
    return this.container ? globalEnv.rawElementQuerySelector.call(this.container, selector) : null;
  }

  public querySelectorAll(selector: string): NodeListOf<Node> {
    return this.container ? globalEnv.rawElementQuerySelectorAll.call(this.container, selector) : [];
  }

  private setState(state: string): void {
    this.state = state;
  }

  public onLoad(): void {
    if (++this.loadSourceLevel === 2 && !this.isUnmounted()) {
      getRootContainer(this.container!).mount(this);
    }
  }

  public onLoadError(e: Error): void {
    this.loadSourceLevel = -1;

    if (!this.isUnmounted()) {
      this.onLoadError(e);
      this.setState(WIDGET_STATUS.LOAD_FAILED);
    }
  }

  public mount({ container, fiber }): void {
    if (this.loadSourceLevel !== 2) {
      this.container = container;
      return this.setState(WIDGET_STATUS.LOADING);
    }

    this.createSandbox();

    const nextAction = () => {
      this.container = container;
      this.fiber = fiber;

      this.setState(WIDGET_STATUS.MOUNTING);

      this.sandBox?.start();

      execScripts(this, (isFinished: boolean) => {
        if (isFinished) {
          this.handleMounted();
        }
      });
    };

    this.iframe ? (this.sandBox as any).sandBoxReady.then(nextAction) : nextAction();
  }
  public unmount(): void {
    throw new Error('Method not implemented.');
  }

  private handleMounted(): void {
    this.setState(WIDGET_STATUS.MOUNTED);

    const el = pureCreateElement('div');
    this.container?.appendChild(el);

    const { library, framework } = this.componentInfo;
    const { exportName, destructuring, props, children } = this.componentInfo;

    let COMPONENT_NAME: any;
    if (destructuring) {
      COMPONENT_NAME = window[library][exportName];
    } else {
      COMPONENT_NAME = window[library];
    }

    if (framework === 'vue3') {
      const { createApp, h } = window.Vue;

      createApp(h(COMPONENT_NAME, props, children)).mount(el);
    } else if (framework === 'vue' || framework === 'vue2') {
      new window.Vue({
        render(h) {
          return h(COMPONENT_NAME, props, children);
        },
      }).$mount(el);
    } else {
      logError(`only support fe-framework of vue2 and vue3!`, this.name);
    }
  }

  public isUnmounted(): boolean {
    return WIDGET_STATUS.UNMOUNT === this.state;
  }
}
