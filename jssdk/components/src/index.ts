import { defineJSSDK, initContext } from '@stall-jssdk/core';

import { MemberTable } from './MemberTable';

initContext({
  CORE_ACCESS: 'stall-web-play-1.0.0-dev-core-access',
});

export const defineSDKMemberSelector = () =>
  defineJSSDK('member-selector', MemberTable);
