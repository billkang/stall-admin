import { isString } from 'lodash-es';
import type { FiberTasks, Func, MicroLocation, MicroWidgetElementTagNameMap } from '../micro-widget-types';

export const rawDefineProperty = Object.defineProperty;
export const rawDefineProperties = Object.defineProperties;
export const rawHasOwnProperty = Object.prototype.hasOwnProperty;

export function defer(fn: Func, ...args: unknown[]): void {
  Promise.resolve().then(fn.bind(null, ...args));
}

export function isPromise(target: unknown): target is Promise<unknown> {
  return toString.call(target) === '[object Promise]';
}

export function isFunction(target: unknown): target is Function {
  return typeof target === 'function';
}

export function isBoundFunction(target: unknown): boolean {
  return (
    // eslint-disable-next-line no-prototype-builtins
    isFunction(target) && target.name.indexOf('bound ') === 0 && !target.hasOwnProperty('prototype')
  );
}

export function isConstructor(target: unknown): boolean {
  if (isFunction(target)) {
    const targetStr = target.toString();

    return (
      (target.prototype?.constructor === target && Object.getOwnPropertyNames(target.prototype).length > 1) ||
      /^function\s+[A-Z]/.test(targetStr) ||
      /^class\s+/.test(targetStr)
    );
  }

  return false;
}

export function isPlainObject<T = Record<PropertyKey, unknown>>(target: unknown): target is T {
  return toString.call(target) === '[object Object]';
}

export function logError(msg: unknown, widgetName: string | null = null, ...rest: unknown[]): void {
  const tip = widgetName && isString(widgetName) ? ` widget ${widgetName}` : '';
  if (isString(msg)) {
    console.error(`[micro-widget]${tip} ${msg}`, ...rest);
  } else {
    console.error(`[micro-widget]${tip}`, msg, ...rest);
  }
}

export function logWarn(msg: unknown, widgetName: string | null = null, ...rest: unknown[]): void {
  const tip = widgetName && isString(widgetName) ? ` widget ${widgetName}` : '';
  if (isString(msg)) {
    console.warn(`[micro-widget]${tip} ${msg}`, ...rest);
  } else {
    console.warn(`[micro-widget]${tip}`, msg, ...rest);
  }
}

export function pureCreateElement<K extends keyof MicroWidgetElementTagNameMap>(
  tagName: K,
  options?: ElementCreationOptions,
): MicroWidgetElementTagNameMap[K] {
  const element = document.createElement(tagName, options);

  element.__PURE_ELEMENT__ = true;

  return element;
}

export function promiseStream<T>(
  promiseList: Array<Promise<T> | T>,
  successCb: CallableFunction,
  errorCb: CallableFunction,
  finallyCb?: CallableFunction,
) {
  let finishedNum = 0;

  function isFinished() {
    if (++finishedNum === promiseList.length && finallyCb) {
      finallyCb();
    }
  }

  promiseList.forEach((p, index) => {
    if (isPromise(p)) {
      (p as Promise<T>)
        .then((res: T) => {
          successCb({ data: res, index });
          isFinished();
        })
        .catch((error: Error) => {
          errorCb({ error, index });
          isFinished();
        });
    } else {
      successCb({ data: p, index });
      isFinished();
    }
  });
}

export function promiseRequestIdle(callback: CallableFunction): Promise<void> {
  return new Promise(resolve => {
    requestIdleCallback(() => {
      callback(resolve);
    });
  });
}

export function injectFiberTask(fiberTasks: FiberTasks, callback: CallableFunction): void {
  if (fiberTasks) {
    fiberTasks.push(() =>
      promiseRequestIdle((resolve: PromiseConstructor['resolve']) => {
        callback();
        resolve();
      }),
    );
  } else {
    callback();
  }
}

export function serialExecFiberTasks(tasks: FiberTasks): Promise<void> | null {
  return tasks?.reduce((pre, next) => pre.then(next), Promise.resolve()) || null;
}

/**
 * create URL as MicroLocation
 */
export const createURL = (function (): (path: string | URL, base?: string) => MicroLocation {
  class Location extends URL {}
  return (path: string | URL, base?: string): MicroLocation => {
    return (base ? new Location('' + path, base) : new Location('' + path)) as MicroLocation;
  };
})();

export function addProtocol(url: string): string {
  return url.startsWith('//') ? `${globalThis.location.protocol}${url}` : url;
}

/**
 * Get valid address, such as https://xxx/xx/xx.html to https://xxx/xx/
 * @param url app.url
 */
export function getEffectivePath(url: string): string {
  const { origin, pathname } = createURL(url);
  if (/\.(\w+)$/.test(pathname)) {
    const fullPath = `${origin}${pathname}`;
    const pathArr = fullPath.split('/');
    pathArr.pop();
    return pathArr.join('/') + '/';
  }

  return `${origin}${pathname}/`.replace(/\/\/$/, '/');
}

export function CompletionPath(path: string, baseURI: string): string {
  if (!path || /^((((ht|f)tps?)|file):)?\/\//.test(path) || /^(data|blob):/.test(path)) return path;

  return createURL(path, getEffectivePath(addProtocol(baseURI))).toString();
}

export function isShadowRoot(target: unknown): target is ShadowRoot {
  return typeof ShadowRoot !== 'undefined' && target instanceof ShadowRoot;
}

export function getRootContainer(target: HTMLElement | ShadowRoot): HTMLElement {
  return (isShadowRoot(target) ? (target as ShadowRoot).host : target) as HTMLElement;
}

export function formatWidgetName(name: string | null): string {
  if (!isString(name) || !name) return '';
  return name.replace(/(^\d+)|([^\w\d-_])/gi, '');
}
