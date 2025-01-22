import { IPublicTypeDOMText } from './dom-text';
import { IPublicTypeNodeSchema } from './node-schema';
import { IPublicTypeJSExpression } from './value-type';

export type IPublicTypeNodeData = IPublicTypeNodeSchema | IPublicTypeJSExpression | IPublicTypeDOMText;
