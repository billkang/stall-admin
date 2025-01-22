import { isString } from 'lodash-es';
import type {
  AttrType,
  MicroWidgetElementType,
  OptionsType,
  OuterComponentInfo,
  WidgetInterface,
} from './micro-widget-types';
import CreateWidget from './create-widget';
import globalEnv from './libs/global-env';
import { defer, formatWidgetName, isFunction, logError } from './libs/utils';
import microWidget from './micro-widget';

export enum ObservedAttrName {
  NAME = 'name',
}

export function defineElement(tagName: string): void {
  class MicroWidgetElement extends HTMLElement implements MicroWidgetElementType {
    static get observedAttributes(): string[] {
      return ['name'];
    }

    public widgetName = '';

    public componentInfo: OuterComponentInfo = {
      library: '',
      framework: 'vue3',
      source: {
        styles: [],
        scripts: [],
      },
      exportName: '',
      destructuring: false,
      props: {},
      children: null,
    };

    public connectedCallback(): void {
      defer(() => {
        if (this.widgetName) {
          this.handleConnected();
        }
      });
    }

    private legalAttribute(name: string, val: AttrType): boolean {
      if (!isString(name) || !val) {
        logError(`unexpected attribute ${name}, please check again ${this.widgetName}`);

        return false;
      }

      return true;
    }

    public attributeChangedCallback(attr: any, _oldVal: string, newVal: string): void {
      if (this.legalAttribute(attr, newVal) && this.widgetName !== newVal) {
        if (!this.widgetName) {
          const formatNewName = formatWidgetName(newVal);

          if (!formatNewName) {
            return logError(`Invalid attribute name ${newVal}`, this.widgetName);
          }

          this.widgetName = formatNewName;

          if (formatNewName !== newVal) {
            this.setAttribute('name', this.widgetName);
          }
        }
      }
    }

    private handleConnected(): void {
      if (!this.widgetName) return;

      if (this.getDisposeResult('shadowDom') && !this.shadowRoot && isFunction(this.attachShadow)) {
        this.attachShadow({ mode: 'open' });
      }

      this.handleCreateWidget();
    }

    private handleCreateWidget(): void {
      const componentInfo = this.getAttribute('component');
      if (componentInfo) {
        const json: OuterComponentInfo = JSON.parse(componentInfo);

        if (!json.exportName) {
          logError(`must supply correct component.exportName info!`, this.widgetName);
          return;
        }

        if (!json.library) {
          logError(`must supply package.library info!`, this.widgetName);
          return;
        }
        if (!json.source || !json.source.scripts) {
          logError(`must supply correct package.source info!`, this.widgetName);
          return;
        }
        if (!json.framework) {
          json.framework = 'vue3';
        }

        if (!json.destructuring) {
          json.destructuring = false;
        }

        this.componentInfo = json;
      } else {
        logError(`must input component props!`, this.widgetName);
      }

      new CreateWidget({
        name: this.widgetName,
        componentInfo: this.componentInfo,
        container: this.shadowRoot ?? this,
      });
    }

    public disconnectedCallback(): void {}

    public getDisposeResult<T extends keyof OptionsType>(name: T): boolean {
      return (this.hasAttribute(name) || !!microWidget.options[name]) && this.getAttribute(name) !== 'false';
    }

    public override mount(widget: WidgetInterface): void {
      widget.mount({
        container: this.shadowRoot ?? this,
        fiber: this.getDisposeResult('fiber'),
      });
    }
  }

  globalEnv.rawWindow.customElements.define(tagName, MicroWidgetElement);
}
