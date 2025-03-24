import { defineJSSDK, initContext } from '@stall-jssdk/core';

import { MemberSelector } from './MemberSelector';
import { ProductTable } from './ProductTable';

import './MemberSelector/style.less';
import './OrganizationSelector/style.less';

initContext({
  CORE_ACCESS: 'stall-web-play-1.0.0-dev-core-access',
});

export const defineSDKMemberSelector = () =>
  defineJSSDK('member-selector', MemberSelector);

export const defineSDKProductTable = () => defineJSSDK('product-table', ProductTable);
