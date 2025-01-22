import type { SandBoxAdapter } from '../micro-widget-types';
import globalEnv from '../libs/global-env';
import { defer } from '../libs/utils';

function setParentNode(target: Node, value: Document | Element): void {
  const descriptor = Object.getOwnPropertyDescriptor(target, 'parentNode');
  if (!descriptor || descriptor.configurable) {
    Object.defineProperty(target, 'parentNode', {
      value,
      configurable: true,
    });
  }
}

export function throttleDeferForParentNode(microDocument: Document): void {
  const html = globalEnv.rawDocument.firstElementChild;

  if (html?.parentNode === globalEnv.rawDocument) {
    setParentNode(html, microDocument);

    defer(() => {
      setParentNode(html, globalEnv.rawDocument);
    });
  }
}

export default class Adapter implements SandBoxAdapter {
  public escapeSetterKeyList: PropertyKey[] = ['location'];

  public staticEscapeProperties: PropertyKey[] = ['System', '__cjsWrapper'];

  public staticScopeProperties: PropertyKey[] = ['webpackJsonp', 'webpackHotUpdate', 'Vue'];
}
