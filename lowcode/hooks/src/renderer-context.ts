import type { Component, ComponentPublicInstance, InjectionKey } from 'vue';
import type { IPublicTypeNodeSchema, IPublicTypeNpmInfo, IPublicTypePackage } from '@stall-lowcode/types';
import { inject, getCurrentInstance } from 'vue';

export type DesignMode = 'live' | 'design';

export interface RendererContext {
  readonly components: Record<string, Component | IPublicTypeNpmInfo | RendererContext>;
  readonly packages: Record<string, IPublicTypePackage>;
  readonly designMode: DesignMode;
  readonly thisRequiredInJSE: boolean;

  getNode(id: string): Node | null;
  rerender(): void;
  wrapLeafComp<C extends object, L extends object>(name: string, comp: C, leaf: L): L;
  triggerCompGetCtx(schema: IPublicTypeNodeSchema, val: ComponentPublicInstance): void;
}

export function getRendererContextKey(): InjectionKey<RendererContext> {
  let key = (window as any).__rendererContext;

  if (!key) {
    key = Symbol('__rendererContext');
    (window as any).__rendererContext = key;
  }

  return key;
}

/**
 * 获取指定属性的值
 * @param props
 * @param key
 * @param defaultValue
 * @returns
 */
function getPropValue<T>(props: Record<string, unknown>, key: string, defaultValue: T): T {
  return (props[key] || props[`__${key}`] || defaultValue) as T;
}

export function useRendererContext(): RendererContext {
  const key = getRendererContextKey();

  return inject(
    key,
    () => {
      const props = getCurrentInstance()?.props ?? {};

      return {
        rerender: () => void 0,
        thisRequiredInJSE: true,
        components: getPropValue(props, 'components', {}),
        designMode: getPropValue<DesignMode>(props, 'designMode', 'live'),
        getNode: getPropValue(props, 'getNode', () => null),
        wrapLeafComp: <C extends object, L extends object>(_: string, __: C, leaf: L) => leaf,
        triggerCompGetCtx: getPropValue(props, 'triggerCompGetCtx', () => void 0),
      };
    },
    true,
  );
}
