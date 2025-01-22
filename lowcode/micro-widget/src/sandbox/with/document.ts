import type {
  CommonEffectHook,
  MicroEventListener,
  MicroWidgetWindowType,
  WithSandBoxInterface,
} from '../../micro-widget-types';
import globalEnv from '../../libs/global-env';
import { isFunction } from '../../libs/utils';
import { throttleDeferForParentNode } from '../adapter';
import bindFunctionToRawTarget from '../bind-function';

function createProxyDocument(sandbox: WithSandBoxInterface): {
  proxyDocument: Document;
  documentEffect: CommonEffectHook;
} {
  const eventListenerMap = new Map<string, Set<MicroEventListener>>();
  const sstEventListenerMap = new Map<string, Set<MicroEventListener>>();

  let onClickHandler: unknown = null;
  let sstOnClickHandler: unknown = null;

  const { rawDocument, rawCreateElement, rawAddEventListener, rawRemoveEventListener } = globalEnv;

  function createElement(tagName: string, options?: ElementCreationOptions): HTMLElement {
    const element = rawCreateElement.call(rawDocument, tagName, options);

    return element;
  }

  function addEventListener(
    type: string,
    listener: MicroEventListener,
    options?: boolean | AddEventListenerOptions,
  ): void {
    const listenerList = eventListenerMap.get(type);

    if (listenerList) {
      listenerList.add(listener);
    } else {
      eventListenerMap.set(type, new Set([listener]));
    }

    listener && (listener.__MICRO_WIDGET_MARK_OPTIONS__ = options);

    rawAddEventListener.call(rawDocument, type, listener, options);
  }

  function removeEventListener(
    type: string,
    listener: MicroEventListener,
    options?: boolean | AddEventListenerOptions,
  ): void {
    const listenerList = eventListenerMap.get(type);
    if (listenerList?.size && listenerList.has(listener)) {
      listenerList.delete(listener);
    }

    rawRemoveEventListener.call(rawDocument, type, listener, options);
  }

  // reset snapshot data
  const reset = (): void => {
    sstEventListenerMap.clear();
    sstOnClickHandler = null;
  };

  /**
   * NOTE:
   *  1. about timer(events & properties should record & rebuild at all modes, exclude default mode)
   *  2. record maybe call twice when unmount prerender, keep-alive app manually with umd mode
   * 4 modes: default-mode、umd-mode、prerender、keep-alive
   * Solution:
   *  1. default-mode(normal): clear events & timers, not record & rebuild anything
   *  2. umd-mode(normal): not clear timers, record & rebuild events
   *  3. prerender/keep-alive(default, umd): not clear timers, record & rebuild events
   */
  const record = (): void => {
    /**
     * record onclick handler
     * onClickHandler maybe set again after prerender/keep-alive app hidden
     */
    sstOnClickHandler = onClickHandler || sstOnClickHandler;

    // record document event
    eventListenerMap.forEach((listenerList, type) => {
      if (listenerList.size) {
        const cacheList = sstEventListenerMap.get(type) || [];
        sstEventListenerMap.set(type, new Set([...cacheList, ...listenerList]));
      }
    });
  };

  // rebuild event and timer before remount app
  const rebuild = (): void => {
    // rebuild onclick event
    if (sstOnClickHandler && !onClickHandler) proxyDocument.onclick = sstOnClickHandler;

    // rebuild document event
    sstEventListenerMap.forEach((listenerList, type) => {
      for (const listener of listenerList) {
        proxyDocument.addEventListener(type, listener, listener?.__MICRO_APP_MARK_OPTIONS__);
      }
    });

    reset();
  };

  // release all event listener & interval & timeout when unmount app
  const release = (): void => {
    // Clear the function bound by micro app through document.onclick
    if (isFunction(onClickHandler)) {
      rawRemoveEventListener.call(rawDocument, 'click', onClickHandler);
    }
    onClickHandler = null;

    // Clear document binding event
    if (eventListenerMap.size) {
      eventListenerMap.forEach((listenerList, type) => {
        for (const listener of listenerList) {
          rawRemoveEventListener.call(rawDocument, type, listener);
        }
      });
      eventListenerMap.clear();
    }
  };

  const proxyDocument = new Proxy(rawDocument, {
    get: (target: Document, key: PropertyKey): unknown => {
      throttleDeferForParentNode(proxyDocument);

      switch (key) {
        case 'createElement':
          return createElement;
        case Symbol.toStringTag:
          return 'ProxyDocument';
        case 'defaultView':
          return sandbox.proxyWindow;
        case 'onclick':
          return onClickHandler;
        case 'addEventListener':
          return addEventListener;
        case 'removeEventListener':
          return removeEventListener;
        default:
          return bindFunctionToRawTarget<Document>(Reflect.get(target, key), rawDocument, 'DOCUMENT');
      }
    },
    set: (target: Document, key: PropertyKey, value: unknown): boolean => {
      if (key === 'onclick') {
        if (isFunction(onClickHandler)) {
          rawRemoveEventListener.call(rawDocument, 'click', onClickHandler, false);
        }

        if (isFunction(value)) {
          rawAddEventListener.call(rawDocument, 'click', value, false);
        }

        onClickHandler = value;
      } else {
        Reflect.set(target, key, value);
      }

      return true;
    },
  });

  return {
    proxyDocument,
    documentEffect: {
      reset,
      record,
      rebuild,
      release,
    },
  };
}

function createMicroDocument(widgetName: string, proxyDocument: Document): Function {
  const { rawDocument, rawRootDocument } = globalEnv;

  class MicroDocument {
    static [Symbol.hasInstance](target: unknown) {
      let proto = target;

      while ((proto = Object.getPrototypeOf(proto))) {
        if (proto === MicroDocument.prototype) {
          return true;
        }
      }

      return target === proxyDocument || target instanceof rawRootDocument;
    }
  }

  Object.setPrototypeOf(MicroDocument, rawRootDocument);

  Object.setPrototypeOf(
    MicroDocument.prototype,
    new Proxy(rawRootDocument.prototype, {
      get(target: Document, key: PropertyKey): unknown {
        return bindFunctionToRawTarget<Document>(Reflect.get(target, key), rawDocument, 'DOCUMENT');
      },
      set(target: Document, key: PropertyKey, value: unknown): boolean {
        Reflect.set(target, key, value);
        return true;
      },
    }),
  );

  return MicroDocument;
}

export function patchDocument(
  widgetName: string,
  microWidgetWindow: MicroWidgetWindowType,
  sandbox: WithSandBoxInterface,
): CommonEffectHook {
  const { proxyDocument, documentEffect } = createProxyDocument(sandbox);
  const MicroDocument = createMicroDocument(widgetName, proxyDocument);

  Object.defineProperties(microWidgetWindow, {
    document: {
      configurable: false,
      enumerable: true,
      get() {
        return proxyDocument;
      },
    },
    Document: {
      configurable: false,
      enumerable: false,
      get() {
        return MicroDocument;
      },
    },
  });

  return documentEffect;
}
