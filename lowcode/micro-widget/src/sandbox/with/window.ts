import { isString } from 'lodash-es';
import type {
  CommonEffectHook,
  MicroEventListener,
  MicroWidgetWindowType,
  TimerInfo,
  WithSandBoxInterface,
} from '../../micro-widget-types';
import { SCOPE_WINDOW_ON_EVENT } from '../../constants';
import globalEnv from '../../libs/global-env';
import { logWarn, rawDefineProperty, rawHasOwnProperty } from '../../libs/utils';
import bindFunctionToRawTarget from '../bind-function';

function patchWindowEvents(widgetName: string, microWidgetWindow: MicroWidgetWindowType): void {
  const { rawWindow } = globalEnv;
  Object.getOwnPropertyNames(rawWindow)
    .filter((key: string) => {
      return /^on/.test(key) && !SCOPE_WINDOW_ON_EVENT.includes(key);
    })
    .forEach((eventName: string) => {
      const { enumerable, writable, set } = Object.getOwnPropertyDescriptor(rawWindow, eventName) || {
        enumerable: true,
        writable: true,
      };

      try {
        Object.defineProperty(microWidgetWindow, eventName, {
          enumerable,
          configurable: true,
          get: () => rawWindow[eventName],
          set:
            writable ?? !!set
              ? value => {
                  rawWindow[eventName] = value;
                }
              : undefined,
        });
      } catch (e) {
        logWarn(e, widgetName);
      }
    });
}

function createProxyWindow(microWidgetWindow: MicroWidgetWindowType, sandbox: WithSandBoxInterface) {
  const { rawWindow } = globalEnv;
  const descriptorTargetMap = new Map<PropertyKey, 'target' | 'rawWindow'>();

  const proxyWindow = new Proxy(microWidgetWindow, {
    get: (target: MicroWidgetWindowType, key: PropertyKey): unknown => {
      if (
        Reflect.has(target, key) ||
        (isString(key) && /^__MICRO_WIDGET_/.test(key)) ||
        sandbox.scopeProperties.includes(key)
      ) {
        return Reflect.get(target, key);
      }

      return bindFunctionToRawTarget(Reflect.get(rawWindow, key), rawWindow);
    },
    set: (target: MicroWidgetWindowType, key: PropertyKey, value: unknown): boolean => {
      if (sandbox.adapter.escapeSetterKeyList.includes(key)) {
        Reflect.set(rawWindow, key, value);
      } else if (
        !rawHasOwnProperty.call(target, key) &&
        rawHasOwnProperty.call(rawWindow, key) &&
        !sandbox.scopeProperties.includes(key)
      ) {
        const descriptor = Object.getOwnPropertyDescriptor(rawWindow, key);
        const { configurable, enumerable, writable, set } = descriptor!;

        rawDefineProperty(target, key, {
          value,
          configurable,
          enumerable,
          writable: writable ?? !set,
        });

        sandbox.injectedKeys.add(key);
      } else {
        !Reflect.has(target, key) && sandbox.injectedKeys.add(key);
        Reflect.set(target, key, value);
      }

      if (
        sandbox.escapeProperties.includes(key) ||
        (sandbox.adapter.staticScopeProperties.includes(key) &&
          !Reflect.has(rawWindow, key) &&
          !sandbox.escapeProperties.includes(key))
      ) {
        !Reflect.has(rawWindow, key) && sandbox.escapeKeys.add(key);
        Reflect.set(rawWindow, key, value);
      }

      return true;
    },
    has: (target: MicroWidgetWindowType, key: PropertyKey): boolean => {
      if (sandbox.escapeProperties.includes(key)) {
        if (sandbox.adapter.staticScopeProperties.includes(key)) {
          return !!target[key];
        }

        return key in target;
      }

      return key in target || key in rawWindow;
    },
    getOwnPropertyDescriptor: (target: MicroWidgetWindowType, key: PropertyKey) => {
      if (rawHasOwnProperty.call(target, key)) {
        descriptorTargetMap.set(key, 'target');
        return Object.getOwnPropertyDescriptor(target, key);
      }

      if (rawHasOwnProperty.call(rawWindow, key)) {
        descriptorTargetMap.set(key, 'rawWindow');
        const descriptor = Object.getOwnPropertyDescriptor(rawWindow, key);
        if (descriptor && !descriptor.configurable) {
          descriptor.configurable = true;
        }
        return descriptor;
      }

      return undefined;
    },
    defineProperty: (target: MicroWidgetWindowType, key: PropertyKey, value: PropertyDescriptor) => {
      const from = descriptorTargetMap.get(key);
      if (from === 'rawWindow') {
        return Reflect.defineProperty(rawWindow, key, value);
      }

      return Reflect.defineProperty(target, key, value);
    },
    ownKeys: (target: MicroWidgetWindowType): Array<string | symbol> => {
      return [...new Set([...Reflect.ownKeys(rawWindow), ...Reflect.ownKeys(target)])];
    },
    deleteProperty: (target: MicroWidgetWindowType, key: PropertyKey): boolean => {
      if (rawHasOwnProperty.call(target, key)) {
        sandbox.injectedKeys.has(key) && sandbox.injectedKeys.delete(key);
        sandbox.escapeKeys.has(key) && Reflect.deleteProperty(rawWindow, key);
        return Reflect.deleteProperty(target, key);
      }

      return true;
    },
  });

  sandbox.proxyWindow = proxyWindow;
}

function patchWindowEffect(microWidgetWindow: MicroWidgetWindowType): CommonEffectHook {
  const eventListenerMap = new Map<string, Set<MicroEventListener>>();
  const sstEventListenerMap = new Map<string, Set<MicroEventListener>>();
  const intervalIdMap = new Map<number, TimerInfo>();
  const timeoutIdMap = new Map<number, TimerInfo>();
  const {
    rawWindow,
    rawAddEventListener,
    rawRemoveEventListener,
    rawDispatchEvent,
    rawSetInterval,
    rawSetTimeout,
    rawClearInterval,
    rawClearTimeout,
  } = globalEnv;

  function getEventTarget(type: string): Window {
    return SCOPE_WINDOW_ON_EVENT.includes(type) ? microWidgetWindow : rawWindow;
  }

  microWidgetWindow.addEventListener = function (
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
    rawAddEventListener.call(getEventTarget(type), type, listener, options);
  };

  microWidgetWindow.removeEventListener = function (
    type: string,
    listener: MicroEventListener,
    options?: boolean | AddEventListenerOptions,
  ): void {
    const listenerList = eventListenerMap.get(type);
    if (listenerList?.size && listenerList.has(listener)) {
      listenerList.delete(listener);
    }
    rawRemoveEventListener.call(getEventTarget(type), type, listener, options);
  };

  microWidgetWindow.dispatchEvent = function (event: Event): boolean {
    return rawDispatchEvent.call(getEventTarget(event?.type), event);
  };

  microWidgetWindow.setInterval = function (handler: TimerHandler, timeout?: number, ...args: any[]): number {
    const intervalId = rawSetInterval.call(rawWindow, handler, timeout, ...args);
    intervalIdMap.set(intervalId, { handler, timeout, args });
    return intervalId;
  };

  microWidgetWindow.setTimeout = function (handler: TimerHandler, timeout?: number, ...args: any[]): number {
    const timeoutId = rawSetTimeout.call(rawWindow, handler, timeout, ...args);
    timeoutIdMap.set(timeoutId, { handler, timeout, args });
    return timeoutId;
  };

  microWidgetWindow.clearInterval = function (intervalId: number) {
    intervalIdMap.delete(intervalId);
    rawClearInterval.call(rawWindow, intervalId);
  };

  microWidgetWindow.clearTimeout = function (timeoutId: number) {
    timeoutIdMap.delete(timeoutId);
    rawClearTimeout.call(rawWindow, timeoutId);
  };

  const reset = () => {
    sstEventListenerMap.clear();
  };

  const record = () => {
    eventListenerMap.forEach((listenerList, type) => {
      if (listenerList.size) {
        const cacheList = sstEventListenerMap.get(type) || [];
        sstEventListenerMap.set(type, new Set([...cacheList, ...listenerList]));
      }
    });
  };

  const rebuild = () => {
    sstEventListenerMap.forEach((listenerList, type) => {
      for (const listener of listenerList) {
        microWidgetWindow.addEventListener(type, listener, listener?.__MICRO_WIDGET_MARK_OPTIONS__);
      }
    });

    reset();
  };

  const release = (clearTimer: boolean): void => {
    if (eventListenerMap.size) {
      eventListenerMap.forEach((listenerList, type) => {
        for (const listener of listenerList) {
          rawRemoveEventListener.call(getEventTarget(type), type, listener);
        }
      });
      eventListenerMap.clear();
    }

    if (clearTimer) {
      intervalIdMap.forEach((_, intervalId: number) => {
        rawClearInterval.call(rawWindow, intervalId);
      });

      timeoutIdMap.forEach((_, timeoutId: number) => {
        rawClearTimeout.call(rawWindow, timeoutId);
      });

      intervalIdMap.clear();
      timeoutIdMap.clear();
    }
  };

  return {
    reset,
    record,
    rebuild,
    release,
  };
}

export function patchWindow(
  widgetName: string,
  microWidgetWindow: MicroWidgetWindowType,
  sandbox: WithSandBoxInterface,
): CommonEffectHook {
  patchWindowEvents(widgetName, microWidgetWindow);
  createProxyWindow(microWidgetWindow, sandbox);
  return patchWindowEffect(microWidgetWindow);
}
