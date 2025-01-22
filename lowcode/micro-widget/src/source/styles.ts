import type { FiberTasks, StyleSourceInfo, WidgetInterface } from '../micro-widget-types';
import { injectFiberTask, logError, promiseStream, pureCreateElement, serialExecFiberTasks } from '../libs/utils';
import scopedCSS, { createPrefix } from '../sandbox/scoped-css';
import { fetchSource } from './fetch';
import sourceCenter from './source-center';

function getExistParsedCode(widgetName: string, prefix: string, styleInfo: StyleSourceInfo): string | undefined {
  const { widgetSpace } = styleInfo;
  for (const item in widgetSpace) {
    if (item !== widgetName) {
      const { parsedCode } = widgetSpace[item];
      if (parsedCode) {
        return parsedCode.replace(new RegExp(createPrefix(item, true), 'g'), prefix);
      }
    }
  }
}

export function handleConvertStyle(
  widget: WidgetInterface,
  address: string,
  convertStyle: HTMLStyleElement,
  styleInfo: StyleSourceInfo,
): void {
  const { name } = widget;
  const spaceData = styleInfo.widgetSpace[name];
  spaceData.prefix = spaceData.prefix || createPrefix(name);

  if (!spaceData.parsedCode) {
    const existParsedCode = getExistParsedCode(name, spaceData.prefix, styleInfo);
    if (!existParsedCode) {
      convertStyle.textContent = styleInfo.code;
      scopedCSS(convertStyle, widget, address);
    } else {
      convertStyle.textContent = existParsedCode;
    }

    spaceData.parsedCode = convertStyle.textContent;
  } else {
    convertStyle.textContent = spaceData.parsedCode;
  }
}

export function fetchStyleSuccess(address: string, code: string, widget: WidgetInterface) {
  const styleInfo = sourceCenter.style.getInfo(address) || { code: '', widgetSpace: {} };
  styleInfo.code = code;

  const convertStyle = pureCreateElement('style');
  handleConvertStyle(widget, address, convertStyle, styleInfo);
  widget.container?.appendChild(convertStyle);
}

export function fetchStyles(widget: WidgetInterface) {
  const {
    name,
    componentInfo: { source },
    fiber,
  } = widget;
  const styleList: Array<string> = source.styles;
  const fetchLinkPromise: Array<Promise<string> | string> = styleList.map(address => {
    let styleInfo: StyleSourceInfo | null = sourceCenter.style.getInfo(address);

    if (!styleInfo) {
      styleInfo = {
        code: '',
        widgetSpace: {
          [name]: {},
        },
      };
    } else {
      styleInfo.widgetSpace[name] = styleInfo.widgetSpace[name] || {};
    }

    sourceCenter.style.setInfo(address, styleInfo!);

    return styleInfo.code ? styleInfo.code : fetchSource(address);
  });

  const fiberTasks: FiberTasks = fiber ? [] : null;

  promiseStream<string>(
    fetchLinkPromise,
    (res: { data: string; index: number }) => {
      injectFiberTask(fiberTasks, () => fetchStyleSuccess(styleList[res.index], res.data, widget));
    },
    (err: { error: Error; index: number }) => {
      logError(err, widget.name);
    },
    () => {
      if (fiberTasks) {
        fiberTasks?.push(() => Promise.resolve(widget.onLoad()));
        serialExecFiberTasks(fiberTasks);
      } else {
        widget.onLoad();
      }
    },
  );
}
