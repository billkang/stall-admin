import { RequestIdleCallbackInfo, RequestIdleCallbackOptions, WidgetInterface } from '@/micro-widget-types';

declare global {
  interface Window {
    requestIdleCallback(callback: (info: RequestIdleCallbackInfo) => void, opts?: RequestIdleCallbackOptions): number;

    rawWindow: Window;
    rawDocument: Document;
    Document: any;
    Element: any;
    Node: any;
    EventTarget: any;
  }

  interface Node {
    __PURE_ELEMENT__?: boolean;
    data?: unknown;
    rawParentNode?: ParentNode | null;
  }

  interface HTMLStyleElement {
    __MICRO_WIDGET_HAS_SCOPED__?: boolean;
  }

  interface HTMLElement {
    mount(widget: WidgetInterface): void;
    unmount(): void;
  }
}

// Check whether the browser supports module script
function isSupportModuleScript(): boolean {
  const s = document.createElement('script');
  return 'noModule' in s;
}

const globalEnv: Record<string, any> = {
  activeSandbox: 0,
};

export function initGlobalEnv(): void {
  const rawWindow = window.rawWindow || Function('return window')();
  const rawDocument = window.rawDocument || Function('return document')();
  const rawRootDocument = rawWindow.Document || Function('return Document')();
  const rawRootElement = rawWindow.Element;
  const rawRootNode = rawWindow.Node;
  const rawRootEventTarget = rawWindow.EventTarget;

  // save patch raw methods, pay attention to this binding
  const rawSetAttribute = rawRootElement.prototype.setAttribute;
  const rawAppendChild = rawRootElement.prototype.appendChild;
  const rawInsertBefore = rawRootElement.prototype.insertBefore;
  const rawReplaceChild = rawRootElement.prototype.replaceChild;
  const rawRemoveChild = rawRootElement.prototype.removeChild;
  const rawAppend = rawRootElement.prototype.append;
  const rawPrepend = rawRootElement.prototype.prepend;
  const rawCloneNode = rawRootElement.prototype.cloneNode;
  const rawElementQuerySelector = rawRootElement.prototype.querySelector;
  const rawElementQuerySelectorAll = rawRootElement.prototype.querySelectorAll;
  const rawInsertAdjacentElement = rawRootElement.prototype.insertAdjacentElement;
  const rawInnerHTMLDesc = Object.getOwnPropertyDescriptor(rawRootElement.prototype, 'innerHTML');
  const rawParentNodeDesc = Object.getOwnPropertyDescriptor(rawRootNode.prototype, 'parentNode');

  // Document proto methods
  const rawCreateElement = rawRootDocument.prototype.createElement;
  const rawCreateElementNS = rawRootDocument.prototype.createElementNS;
  const rawCreateDocumentFragment = rawRootDocument.prototype.createDocumentFragment;
  const rawCreateTextNode = rawRootDocument.prototype.createTextNode;
  const rawCreateComment = rawRootDocument.prototype.createComment;
  const rawQuerySelector = rawRootDocument.prototype.querySelector;
  const rawQuerySelectorAll = rawRootDocument.prototype.querySelectorAll;
  const rawGetElementById = rawRootDocument.prototype.getElementById;
  const rawGetElementsByClassName = rawRootDocument.prototype.getElementsByClassName;
  const rawGetElementsByTagName = rawRootDocument.prototype.getElementsByTagName;
  const rawGetElementsByName = rawRootDocument.prototype.getElementsByName;

  /**
   * save effect raw methods
   * pay attention to this binding, especially setInterval, setTimeout, clearInterval, clearTimeout
   */
  const rawSetInterval = rawWindow.setInterval;
  const rawSetTimeout = rawWindow.setTimeout;
  const rawClearInterval = rawWindow.clearInterval;
  const rawClearTimeout = rawWindow.clearTimeout;
  const rawAddEventListener = rawRootEventTarget.prototype.addEventListener;
  const rawRemoveEventListener = rawRootEventTarget.prototype.removeEventListener;
  const rawDispatchEvent = rawRootEventTarget.prototype.dispatchEvent;

  Object.assign(globalEnv, {
    supportModuleScript: isSupportModuleScript(),

    // common global vars
    rawWindow,
    rawDocument,
    rawRootDocument,
    rawRootElement,
    rawRootNode,

    // source/patch
    rawSetAttribute,
    rawAppendChild,
    rawInsertBefore,
    rawReplaceChild,
    rawRemoveChild,
    rawAppend,
    rawPrepend,
    rawCloneNode,
    rawElementQuerySelector,
    rawElementQuerySelectorAll,
    rawInsertAdjacentElement,
    rawInnerHTMLDesc,
    rawParentNodeDesc,

    rawCreateElement,
    rawCreateElementNS,
    rawCreateDocumentFragment,
    rawCreateTextNode,
    rawCreateComment,
    rawQuerySelector,
    rawQuerySelectorAll,
    rawGetElementById,
    rawGetElementsByClassName,
    rawGetElementsByTagName,
    rawGetElementsByName,

    // sandbox/effect
    rawSetInterval,
    rawSetTimeout,
    rawClearInterval,
    rawClearTimeout,
    rawAddEventListener,
    rawRemoveEventListener,
    rawDispatchEvent,
  });
}

export default globalEnv;
