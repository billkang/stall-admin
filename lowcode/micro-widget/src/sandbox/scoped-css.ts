import type { WidgetInterface } from '../micro-widget-types';
import { logError } from '../libs/utils';
import microWidget from '../micro-widget';
import CSSParser from './css-parser';

export function createPrefix(widgetName: string, reg = false): string {
  const regCharacter = reg ? '\\' : '';

  return `${microWidget.tagName}${regCharacter}[name=${widgetName}${regCharacter}]`;
}

function parseCSS(styleElement: HTMLStyleElement, widgetName: string, prefix: string, linkPath?: string) {
  if (!styleElement.__MICRO_WIDGET_HAS_SCOPED__) {
    styleElement.__MICRO_WIDGET_HAS_SCOPED__ = true;

    let result: string | null = null;

    try {
      result = parser.exec(styleElement.textContent!, prefix, '', linkPath);
      parser.reset();
    } catch (e) {
      parser.reset();
      logError('an error happened when parsing css: ', widgetName, e);
    }

    if (result) {
      styleElement.textContent = result;
    }
  }
}

let parser: CSSParser;
export default function scopedCSS(
  styleElement: HTMLStyleElement,
  widget: WidgetInterface,
  linkPath?: string,
): HTMLStyleElement {
  const prefix = createPrefix(widget.name);

  if (!parser) {
    parser = new CSSParser();
  }

  if (styleElement.textContent) {
    parseCSS(styleElement, widget.name, prefix, linkPath);
  } else {
    const observer = new MutationObserver(function () {
      observer.disconnect();

      if (styleElement.textContent && !styleElement.hasAttribute('data-styled')) {
        parseCSS(styleElement, widget.name, prefix, linkPath);
      }
    });
    observer.observe(styleElement, { childList: true });
  }

  return styleElement;
}
