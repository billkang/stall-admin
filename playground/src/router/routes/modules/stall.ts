import type { RouteRecordRaw } from 'vue-router';

import {
  STALL_DOC_URL,
  STALL_LOGO_URL,
} from '@stall/constants';

import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      badgeType: 'dot',
      icon: STALL_LOGO_URL,
      order: 9999,
      title: $t('demos.stall.title'),
    },
    name: 'StallProject',
    path: '/stall-admin',
    children: [
      {
        name: 'StallAbout',
        path: '/stall-admin/about',
        component: () => import('#/views/_core/about/index.vue'),
        meta: {
          icon: 'lucide:copyright',
          title: $t('demos.stall.about'),
        },
      },
      {
        name: 'StallDocument',
        path: '/stall-admin/document',
        component: IFrameView,
        meta: {
          icon: 'lucide:book-open-text',
          link: STALL_DOC_URL,
          title: $t('demos.stall.document'),
        },
      },
    ],
  },
];

export default routes;
