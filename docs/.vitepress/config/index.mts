import { withPwa } from '@vite-pwa/vitepress';
import { defineConfigWithTheme } from 'vitepress';

import { shared } from './shared.mts';
import { zh } from './zh.mts';

export default withPwa(
  defineConfigWithTheme({
    ...shared,
    locales: {
      root: {
        label: '简体中文',
        lang: 'zh-CN',
        ...zh,
      },
    },
  }),
);
