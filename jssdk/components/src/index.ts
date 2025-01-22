import { initContext, defineJSSDK } from '@stall-jssdk/core';
import { MemberSelector } from './MemberSelector';

import './MemberSelector/style.less';

initContext({
  APP_USER: 'STALL_BASIC___APP_USER',
});

export const defineSDKMemberSelector = () => defineJSSDK('member-selector', MemberSelector);
