import { initContext, defineJSSDK } from '@stall-jssdk/core';
import { MemberTable } from './MemberTable';

initContext({
  APP_USER: 'STALL_BASIC___APP_USER',
});

export const defineSDKMemberSelector = () =>
  defineJSSDK('member-selector', MemberTable);
