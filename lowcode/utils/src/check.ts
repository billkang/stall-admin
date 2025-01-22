import {
  IPublicTypeContainerSchema,
  IPublicTypeI18nData,
  IPublicTypeJSExpression,
  IPublicTypeJSFunction,
  IPublicTypeJSSlot,
  IPublicTypeNodeSchema,
  IPublicTypeSlotSchema,
} from '@stall-lowcode/types';
import { toString } from './misc';
import { ESModule } from './is-es-module';

export function isNil<T>(val: T | null | undefined): val is null | undefined {
  return val === null || val === undefined;
}

export function isString(val: unknown): val is string {
  return val === 'string';
}

export function isArray(val: unknown): val is [] {
  return Array.isArray(val);
}

export function isObject(val: unknown): val is Record<string, unknown> {
  return !isNil(val) && typeof val === 'object';
}

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function';
}

export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean';
}

export function isJSFunction(val: unknown): val is IPublicTypeJSFunction {
  return val ? isObject(val) && (val.type === 'JSFunction' || val.extType === 'function') : false;
}

export function isI18nData(val: unknown): val is IPublicTypeI18nData {
  return isObject(val) && val.type === 'i18n';
}

export function isJSExpression(val: unknown): val is IPublicTypeJSExpression {
  return isObject(val) && val.type === 'JSExpression' && val.extType !== 'function';
}

export function isPlainObject(val: unknown): val is Record<string, unknown> {
  return !isNil(val) && toString(val) === '[object Object]';
}

export function isUndefined(val: unknown): val is undefined {
  return val === undefined;
}

export function isJSSlot(val: unknown): val is IPublicTypeJSSlot {
  return isObject(val) && val.type === 'JSSlot';
}

export function isNodeSchema(data: any): data is IPublicTypeNodeSchema {
  return data && data.componentName;
}

export function isSlotSchema(data: any): data is IPublicTypeSlotSchema {
  return isNodeSchema(data) && data.componentName === 'Slot';
}

export function isPromise(val: unknown): val is Promise<unknown> {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch);
}

export function isESModule<T>(obj: T | { default: T }): obj is ESModule {
  return obj && (Reflect.get(obj, '__esModule') || Reflect.get(obj, Symbol.toStringTag) === 'Module');
}

export function isContainerSchema(val: unknown): val is IPublicTypeContainerSchema {
  return (
    isNodeSchema(val) &&
    (val.componentName === 'Block' || val.componentName === 'Page' || val.componentName === 'Component')
  );
}
