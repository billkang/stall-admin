import type { RouteRecordRaw } from 'vue-router';

import { STALL_LOGO_URL } from '@stall/constants';

import { BasicLayout } from '#/layouts';
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
    ],
  },
];

export default routes;
