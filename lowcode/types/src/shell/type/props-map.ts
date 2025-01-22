import { IPublicTypeNodeData } from './node-data';
import { IPublicTypeCompositeObject } from './value-type';

export type IPublicTypePropsMap = IPublicTypeCompositeObject<IPublicTypeNodeData | IPublicTypeNodeData[]>;
