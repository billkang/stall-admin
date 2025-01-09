import type { DefaultTheme } from 'vitepress';

import { defineConfig } from 'vitepress';

export const zh = defineConfig({
  description: 'Stall Admin & 企业级管理系统框架',
  lang: 'zh-Hans',
  themeConfig: {
    darkModeSwitchLabel: '主题',
    darkModeSwitchTitle: '切换到深色模式',
    docFooter: {
      next: '下一页',
      prev: '上一页',
    },
    footer: {
      copyright: `Copyright © 2020-${new Date().getFullYear()} Stall`,
    },
    lightModeSwitchTitle: '切换到浅色模式',
    nav: nav(),

    outline: {
      label: '页面导航',
    },
    returnToTopLabel: '回到顶部',

    sidebar: {
      '/components/': { base: '/components/', items: sidebarComponents() },
      '/guide/': { base: '/guide/', items: sidebarGuide() },
      '/teaching/': { base: '/teaching/', items: sidebarTeaching() },
    },
    sidebarMenuLabel: '菜单',
  },
});

function sidebarTeaching(): DefaultTheme.SidebarItem[] {
  return [
    {
      collapsed: false,
      text: 'javascript',
      items: [
        {
          link: 'js/dynamic-vs-static',
          text: '动态语言和静态语言的比较',
        },
        {
          link: 'js/proto-vs-class',
          text: '原型继承和类继承的比较',
        },
      ],
    },
    {
      collapsed: false,
      text: 'node.js',
      items: [
        {
          link: 'nodejs/introduction',
          text: 'Node.js介绍',
        },
        {
          link: 'nodejs/server',
          text: '服务器知识介绍',
        },
      ],
    },
    {
      collapsed: false,
      text: '性能优化',
      items: [
        {
          link: 'performance/introduction',
          text: '性能优化介绍',
        },
      ],
    },
  ];
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      collapsed: false,
      text: '简介',
      items: [
        {
          link: 'introduction/stall',
          text: '关于 Stall Admin',
        },
        { link: 'introduction/quick-start', text: '快速开始' },
      ],
    },
    {
      text: '基础',
      items: [
        { link: 'essentials/concept', text: '基础概念' },
        { link: 'essentials/development', text: '本地开发' },
        { link: 'essentials/route', text: '路由和菜单' },
        { link: 'essentials/settings', text: '配置' },
        { link: 'essentials/icons', text: '图标' },
        { link: 'essentials/styles', text: '样式' },
        { link: 'essentials/external-module', text: '外部模块' },
        { link: 'essentials/build', text: '构建与部署' },
        { link: 'essentials/server', text: '服务端交互与数据Mock' },
      ],
    },
    {
      text: '深入',
      items: [
        { link: 'in-depth/login', text: '登录' },
        { link: 'in-depth/theme', text: '主题' },
        { link: 'in-depth/access', text: '权限' },
        { link: 'in-depth/locale', text: '国际化' },
        { link: 'in-depth/features', text: '常用功能' },
        { link: 'in-depth/check-updates', text: '检查更新' },
        { link: 'in-depth/loading', text: '全局loading' },
      ],
    },
    {
      text: '工程',
      items: [
        { link: 'project/standard', text: '规范' },
        { link: 'project/cli', text: 'CLI' },
        { link: 'project/dir', text: '目录说明' },
        { link: 'project/test', text: '单元测试' },
        { link: 'project/tailwindcss', text: 'Tailwind CSS' },
        { link: 'project/vite', text: 'Vite Config' },
      ],
    },
  ];
}

function sidebarComponents(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '组件',
      items: [
        {
          link: 'introduction',
          text: '介绍',
        },
      ],
    },
    {
      collapsed: false,
      text: '布局组件',
      items: [
        {
          link: 'layout-ui/page',
          text: 'Page 页面',
        },
      ],
    },
    {
      collapsed: false,
      text: '通用组件',
      items: [
        {
          link: 'common-ui/stall-api-component',
          text: 'ApiComponent Api组件包装器',
        },
        {
          link: 'common-ui/stall-modal',
          text: 'Modal 模态框',
        },
        {
          link: 'common-ui/stall-drawer',
          text: 'Drawer 抽屉',
        },
        {
          link: 'common-ui/stall-form',
          text: 'Form 表单',
        },
        {
          link: 'common-ui/stall-vxe-table',
          text: 'Vxe Table 表格',
        },
        {
          link: 'common-ui/stall-count-to-animator',
          text: 'CountToAnimator 数字动画',
        },
        {
          link: 'common-ui/stall-ellipsis-text',
          text: 'EllipsisText 省略文本',
        },
      ],
    },
  ];
}

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      link: '/guide/introduction/stall',
      text: '开发指南',
    },
    {
      link: '/components/introduction',
      text: '组件介绍',
    },
    {
      link: '/teaching/introduction',
      text: '前端教程',
    },
  ];
}

export const search: DefaultTheme.AlgoliaSearchOptions['locales'] = {
  root: {
    placeholder: '搜索文档',
    translations: {
      button: {
        buttonAriaLabel: '搜索文档',
        buttonText: '搜索文档',
      },
      modal: {
        errorScreen: {
          helpText: '你可能需要检查你的网络连接',
          titleText: '无法获取结果',
        },
        footer: {
          closeText: '关闭',
          navigateText: '切换',
          searchByText: '搜索提供者',
          selectText: '选择',
        },
        noResultsScreen: {
          noResultsText: '无法找到相关结果',
          reportMissingResultsLinkText: '点击反馈',
          reportMissingResultsText: '你认为该查询应该有结果？',
          suggestedQueryText: '你可以尝试查询',
        },
        searchBox: {
          cancelButtonAriaLabel: '取消',
          cancelButtonText: '取消',
          resetButtonAriaLabel: '清除查询条件',
          resetButtonTitle: '清除查询条件',
        },
        startScreen: {
          favoriteSearchesTitle: '收藏',
          noRecentSearchesText: '没有搜索历史',
          recentSearchesTitle: '搜索历史',
          removeFavoriteSearchButtonTitle: '从收藏中移除',
          removeRecentSearchButtonTitle: '从搜索历史中移除',
          saveRecentSearchButtonTitle: '保存至搜索历史',
        },
      },
    },
  },
};
