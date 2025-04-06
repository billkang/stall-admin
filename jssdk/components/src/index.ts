import { defineJSSDK } from '@stall-jssdk/core';

import { FileUplader } from './FleUploader';
import { MemberSelector } from './MemberSelector';
import { ProductTable } from './ProductTable';

import './MemberSelector/style.less';

export const defineSDKFileUploader = () =>
  defineJSSDK('file-uploader', FileUplader);

export const defineSDKMemberSelector = () =>
  defineJSSDK('member-selector', MemberSelector);

export const defineSDKProductTable = () =>
  defineJSSDK('product-table', ProductTable);
