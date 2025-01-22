import { isObject } from 'lodash-es';

import type { FiberTasks, MicroWidgetWindowType, ScriptSourceInfo, WidgetInterface } from '../micro-widget-types';
import { GLOBAL_CACHED_KEY } from '../constants';
import globalEnv from '../libs/global-env';
import { injectFiberTask, logError, promiseStream, pureCreateElement, serialExecFiberTasks } from '../libs/utils';
import { fetchSource } from './fetch';
import sourceCenter from './source-center';

function getSandboxType(widget: WidgetInterface): 'with' | 'iframe' {
  return widget.iframe ? 'iframe' : 'with';
}

function bindScope(address: string, widget: WidgetInterface, code: string) {
  return widget.iframe
    ? `;(function(window,self,global){;${code}\n//# sourceURL=${address}\n}).call(window.__MICRO_WIDGET_SANDBOX__.proxyWindow,window.__MICRO_WIDGET_SANDBOX__.proxyWindow,window.__MICRO_WIDGET_SANDBOX__.proxyWindow,window.__MICRO_WIDGET_SANDBOX__.proxyWindow);`
    : `;(function(proxyWindow){with(proxyWindow.__MICRO_WIDGET_WINDOW__){(function(${GLOBAL_CACHED_KEY}){;${code}\n//# sourceURL=${address}\n}).call(proxyWindow, ${GLOBAL_CACHED_KEY})}})(window.__MICRO_WIDGET_PROXY_WINDOW__);`;
}

function getExistParseResult(
  widget: WidgetInterface,
  scriptInfo: ScriptSourceInfo,
  currentCode: string,
): Function | undefined {
  const space = scriptInfo.widgetSpace;
  for (const item in space) {
    if (item !== widget.name) {
      const spaceData = space[item];
      if (spaceData.parsedCode === currentCode && spaceData.parsedFunction) {
        return spaceData.parsedFunction;
      }
    }
  }
}

function getEffectWindow(widget: WidgetInterface): MicroWidgetWindowType {
  return widget.iframe ? widget.sandBox.microWidgetWindow : globalEnv.rawWindow;
}

function code2Function(widget: WidgetInterface, code: string): Function {
  const targetWindow = getEffectWindow(widget);
  return new targetWindow.Function(code);
}

function getParsedFunction(widget: WidgetInterface, scriptInfo: ScriptSourceInfo, parsedCode: string): Function {
  return getExistParseResult(widget, scriptInfo, parsedCode) || code2Function(widget, parsedCode);
}

function setActiveProxyWindow(widget: WidgetInterface): void {
  if (widget.sandBox) {
    globalEnv.rawWindow.__MICRO_WIDGET_PROXY_WINDOW__ = widget.sandBox.proxyWindow;
  }
}

function actionsBeforeRunScript(widget: WidgetInterface): void {
  setActiveProxyWindow(widget);
}

export function fetchScriptSuccess(
  url: string,
  scriptInfo: ScriptSourceInfo,
  code: string,
  widget: WidgetInterface,
): void {
  scriptInfo.code = code;

  const spaceData = scriptInfo.widgetSpace[widget.name];

  if (!spaceData.parsedCode) {
    spaceData.parsedCode = bindScope(url, widget, code);
    spaceData.sandboxType = getSandboxType(widget);

    try {
      spaceData.parsedFunction = getParsedFunction(widget, scriptInfo, spaceData.parsedCode);
    } catch (e) {
      logError(`something went wrong while loading widget: ${widget.name} resources
      ${e}`);
    }
  }
}

export function fetchScripts(widget: WidgetInterface): void {
  const {
    name,
    componentInfo: { source },
    fiber,
  } = widget;
  const fetchScriptPromise: Array<Promise<string> | string> = [];
  const fetchScriptPromiseInfo: Array<[string, ScriptSourceInfo]> = [];

  for (const script of source.scripts) {
    let url;
    if (isObject(script)) {
      url = script.url;
    } else {
      url = script;
    }

    let scriptInfo: ScriptSourceInfo | null = sourceCenter.script.getInfo(url)!;

    if (!scriptInfo) {
      scriptInfo = {
        code: '',
        widgetSpace: {
          [name]: {},
        },
      };
    } else {
      scriptInfo.widgetSpace[name] = scriptInfo.widgetSpace[name] || {};
    }
    sourceCenter.script.setInfo(url, scriptInfo!);

    fetchScriptPromise.push(scriptInfo.code ? scriptInfo.code : fetchSource(url));
    fetchScriptPromiseInfo.push([url, scriptInfo!]);
  }

  const fiberTasks: FiberTasks = fiber ? [] : null;

  if (fetchScriptPromise.length) {
    promiseStream<string>(
      fetchScriptPromise,
      (res: { data: string; index: number }) => {
        const { data, index } = res;
        injectFiberTask(fiberTasks, () =>
          fetchScriptSuccess(fetchScriptPromiseInfo[index][0], fetchScriptPromiseInfo[index][1], data, widget),
        );
      },
      (err: { error: Error; index: number }) => {
        logError(err, name);
      },
      () => {
        if (fiberTasks) {
          fiberTasks.push(() => Promise.resolve(widget.onLoad()));
          serialExecFiberTasks(fiberTasks);
        } else {
          widget.onLoad();
        }
      },
    );
  } else {
    widget.onLoad();
  }
}

function runParsedFunction(widget: WidgetInterface, scriptInfo: ScriptSourceInfo) {
  const spaceData = scriptInfo.widgetSpace[widget.name];
  if (!spaceData.parsedFunction) {
    spaceData.parsedFunction = getParsedFunction(widget, scriptInfo, spaceData.parsedCode!);
  }

  spaceData.parsedFunction.call(getEffectWindow(widget));
}

function runCodeInlineScript(widget: WidgetInterface, code: string): void {
  const scriptElement = pureCreateElement('script');
  scriptElement.textContent = code;
  widget.container?.appendChild(scriptElement);
}

export function runScript(url: string, type: string, widget: WidgetInterface, scriptInfo: ScriptSourceInfo): void {
  try {
    actionsBeforeRunScript(widget);

    const spaceData = scriptInfo.widgetSpace[widget.name];
    const sandboxType = getSandboxType(widget);

    if (!spaceData.parsedCode || spaceData.sandboxType !== sandboxType) {
      spaceData.parsedCode = bindScope(url, widget, scriptInfo.code);
      spaceData.sandboxType = sandboxType;
      spaceData.parsedFunction = null;
    }

    if (type === 'umd') {
      runParsedFunction(widget, scriptInfo);
    } else {
      runCodeInlineScript(widget, scriptInfo.code);
    }
  } catch (e) {
    logError(`runScript error: ${e}`, widget.name, `address: ${url}`);
  }
}

export function execScripts(widget: WidgetInterface, callback: CallableFunction): void {
  const {
    componentInfo: { source },
  } = widget;

  for (const script of source.scripts) {
    try {
      let url;
      let type;
      if (isObject(script)) {
        url = script.url;
        type = script.type;
      } else {
        url = script;
        type = 'umd';
      }

      const scriptInfo = sourceCenter.script.getInfo(url);
      runScript(url, type, widget, scriptInfo!);
    } catch (e) {
      callback(false);
    }
  }

  callback(true);
}
