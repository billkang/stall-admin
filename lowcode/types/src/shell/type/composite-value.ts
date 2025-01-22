import {
  IPublicTypeCompositeArray,
  IPublicTypeCompositeObject,
  IPublicTypeJSExpression,
  IPublicTypeJSFunction,
  IPublicTypeJSONValue,
  IPublicTypeJSSlot,
} from './value-type';

/**
 * 复合类型
 */
export type IPublicTypeCompositeValue =
  | IPublicTypeJSONValue
  | IPublicTypeJSExpression
  | IPublicTypeJSFunction
  | IPublicTypeJSSlot
  | IPublicTypeCompositeArray
  | IPublicTypeCompositeObject;
