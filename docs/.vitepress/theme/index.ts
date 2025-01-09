// https://vitepress.dev/guide/custom-theme
import type { EnhanceAppContext, Theme } from 'vitepress';

import DefaultTheme from 'vitepress/theme';

import { DemoPreview } from '../components';
import SiteLayout from './components/site-layout.vue';

import './styles';

import 'virtual:group-icons.css';

export default {
  async enhanceApp(ctx: EnhanceAppContext) {
    const { app } = ctx;
    app.component('DemoPreview', DemoPreview);
  },
  extends: DefaultTheme,
  Layout: SiteLayout,
} satisfies Theme;
