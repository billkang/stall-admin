import { defineJSSDK, initContext } from '@stall-jssdk/core';

import { FileUplader } from './FleUploader';
import { FileUpladerWorker } from './FleUploaderWorker';
import { MemberSelector } from './MemberSelector';
import { ProductTable } from './ProductTable';

import './MemberSelector/style.less';

initContext({
  CORE_ACCESS: 'stall-web-play-1.0.0-dev-core-access',
});

export const defineSDKFileUploader = () =>
  defineJSSDK('file-uploader', FileUplader);

export const defineSDKFileUploaderWorker = () =>
  defineJSSDK('file-uploader-worker', FileUpladerWorker);

export const defineSDKMemberSelector = () =>
  defineJSSDK('member-selector', MemberSelector);

export const defineSDKProductTable = () =>
  defineJSSDK('product-table', ProductTable);
