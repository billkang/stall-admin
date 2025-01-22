import { isBoolean } from 'lodash-es';
import { isBoundFunction, isConstructor, isFunction } from '../libs/utils';

function isConstructorFunction(value: FunctionConstructor & { __MICRO_WIDGET_IS_CONSTRUCTOR__: boolean }): boolean {
  if (isBoolean(value.__MICRO_WIDGET_IS_CONSTRUCTOR__)) return value.__MICRO_WIDGET_IS_CONSTRUCTOR__;

  return (value.__MICRO_WIDGET_IS_CONSTRUCTOR__ = isConstructor(value));
}

function isBoundedFunction(value: CallableFunction & { __MICRO_WIDGET_IS_BOUND_FUNCTION__: boolean }): boolean {
  if (isBoolean(value.__MICRO_WIDGET_IS_BOUND_FUNCTION__)) return value.__MICRO_WIDGET_IS_BOUND_FUNCTION__;

  return (value.__MICRO_WIDGET_IS_BOUND_FUNCTION__ = isBoundFunction(value));
}

export default function bindFunctionToRawTarget<T = Window, B = unknown>(value: any, rawTarget: T, key = 'WINDOW'): B {
  if (isFunction(value) && !isConstructorFunction(value) && !isBoundedFunction(value)) {
    const cacheKey = `__MICRO_WIDGET_BOUND_${key}_FUNCTION__`;

    if (value[cacheKey]) return value[cacheKey];

    const bindRawObjectValue = value.bind(rawTarget);

    for (const key in value) {
      bindRawObjectValue[key] = value[key];
    }

    // eslint-disable-next-line no-prototype-builtins
    if (value.hasOwnProperty('prototype')) {
      Object.defineProperty(bindRawObjectValue, 'prototype', {
        value: value.prototype,
        configurable: true,
        enumerable: true,
        writable: true,
      });
    }

    return (value[cacheKey] = bindRawObjectValue);
  }

  return value;
}
