import type { MicroWidgetBaseType, OptionsType } from './micro-widget-types';
import globalEnv, { initGlobalEnv } from './libs/global-env';
import { isPlainObject, logError, logWarn } from './libs/utils';
import { defineElement } from './micro-widget-element';
import { getGlobalAssets } from './prefetch';

class MicroWidget implements MicroWidgetBaseType {
  tagName = 'micro-widget';
  options: OptionsType = {};

  start(options?: OptionsType): void {
    if (!window.customElements) {
      return logError('micro-widget is not supported, because window.customElements is undefined!');
    }

    if (options?.tagName) {
      if (/^micro-widget(-\S+)?/.test(options.tagName)) {
        this.tagName = options.tagName;
      } else {
        return logError(`${options.tagName} is invalid tagName!`);
      }
    }

    initGlobalEnv();

    if (globalEnv.rawWindow.customElements.get(this.tagName)) {
      return logWarn(`element ${this.tagName} is already defined!`);
    }

    if (isPlainObject<OptionsType>(options)) {
      this.options = options;

      const { globalAssets } = options;

      if (globalAssets) {
        getGlobalAssets(globalAssets);
      }
    }

    defineElement(this.tagName);
  }
}

const microWidget = new MicroWidget();

export default microWidget;
