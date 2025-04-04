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
      '/course/': { base: '/course/', items: sidebarCourse() },
      '/guide/': { base: '/guide/', items: sidebarGuide() },
      '/teaching/': { base: '/teaching/', items: sidebarTeaching() },
    },
    sidebarMenuLabel: '菜单',
  },
});

function sidebarCourse(): DefaultTheme.SidebarItem[] {
  return [
    {
      collapsed: false,
      text: '数据中台-课时1',
      items: [
        {
          link: 'lesson1_background/introduction',
          text: '项目背景介绍',
        },
        {
          link: 'lesson1_background/rbac',
          text: 'RBAC权限管理入门指南',
        },
      ],
    },
    {
      collapsed: false,
      text: '数据中台-课时2',
      items: [
        {
          link: 'lesson2_basic/axios',
          text: 'Axios 深入解析',
        },
        {
          link: 'lesson2_basic/how-to-use-axios',
          text: 'Axios 封装：为企业级应用提供健壮的 HTTP 请求管理',
        },
        {
          link: 'lesson2_basic/using-axios',
          text: 'Axios 封装：项目实践',
        },
        {
          link: 'lesson2_basic/how-to-use-vue-router',
          text: 'Vue Router 在项目开发中的应用与封装指南',
        },
      ],
    },
    {
      collapsed: false,
      text: '数据中台-课时3',
      items: [
        {
          link: 'lesson3_table/how-to',
          text: 'Vue 3业务组件封装：从设计到开发',
        },
        {
          link: 'lesson3_table/galaxy-table',
          text: '自定义 Galaxy Table 组件开发指南',
        },
      ],
    },
    {
      collapsed: false,
      text: '数据中台-课时4',
      items: [
        {
          link: 'lesson4_web-components/introduction',
          text: 'Web Components 全面解析：构建模块化与可重用的前端组件',
        },
        {
          link: 'lesson4_web-components/how-to',
          text: '使用 Web Components 封装前端组件的实操指南',
        },
        {
          link: 'lesson4_web-components/how-to-vue3',
          text: '使用 Web Components 封装 Vue 3 组件',
        },
      ],
    },
    {
      collapsed: false,
      text: '数据中台-课时5',
      items: [
        {
          link: 'lesson5_micro-frontend/introduction',
          text: '微前端：架构模式、技术实现与最佳实践',
        },
        {
          link: 'lesson5_micro-frontend/how-to',
          text: '使用 micro-app 进行微前端接入',
        },
      ],
    },
    {
      collapsed: false,
      text: '数据中台-课时6',
      items: [
        {
          link: 'lesson6_big-file-upload/how-to',
          text: '大文件分片上传实现指南',
        },
      ],
    },
    {
      collapsed: false,
      text: '数据中台-课时7',
      items: [
        {
          link: 'lesson6_webworker/how-to',
          text: '实时动态图表组件的Web Worker架构实践',
        },
      ],
    },
    {
      collapsed: false,
      text: '数据中台-课时8',
      items: [
        {
          link: 'lesson8_work-skills/git',
          text: 'Git 使用指南',
        },
        {
          link: 'lesson8_work-skills/agile',
          text: '敏捷开发指南',
        },
      ],
    },
  ];
}

function sidebarTeaching(): DefaultTheme.SidebarItem[] {
  return [
    {
      collapsed: false,
      text: '前端',
      items: [
        {
          link: 'fe/web-security',
          text: 'Web 安全全面解析',
        },
        {
          link: 'fe/typescript',
          text: 'TypeScript：从基础到进阶的系统性介绍',
        },
        {
          link: 'fe/typescript-advanced',
          text: 'TypeScript 高级编程：面向对象与高级特性详解',
        },
        {
          link: 'fe/typescript-qa',
          text: 'TypeScript 面试常见问题汇总',
        },
      ],
    },
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
        {
          link: 'js/ec',
          text: 'JavaScript 执行上下文、作用域、作用域链与 this',
        },
        {
          link: 'js/closure',
          text: 'JavaScript 闭包权威指南',
        },
        {
          link: 'js/object-create',
          text: '对象创建方式概括',
        },
        {
          link: 'js/object-inherit',
          text: '对象继承方式总结',
        },
        {
          link: 'js/event-loop',
          text: '深入解析 JavaScript 事件执行队列',
        },
        {
          link: 'js/async',
          text: 'JavaScript 异步编程详解',
        },
        {
          link: 'js/boxing-unboxing',
          text: 'JavaScript 装箱与拆箱操作全面指南',
        },
        {
          link: 'js/borrowing',
          text: '理解 JavaScript 中的借用方法',
        },
        {
          link: 'js/valueOf-toString',
          text: 'JavaScript 中的 `valueOf` 和 `toString` 方法',
        },
      ],
    },
    {
      collapsed: false,
      text: 'vue',
      items: [
        {
          link: 'vue/virtual-dom',
          text: 'Virtual DOM 介绍',
        },
        {
          link: 'vue/binding',
          text: '双向绑定实现方案深度解析',
        },
        {
          link: 'vue/rendering',
          text: 'Vue 3 渲染原理',
        },
        {
          link: 'vue/compile',
          text: 'Vue3 模板编译原理详解',
        },
        {
          link: 'vue/vue-router',
          text: 'Vue Router 深度解析与实现原理',
        },
        {
          link: 'vue/pinia',
          text: 'Pinia 深度解析',
        },
        {
          link: 'vue/ssr',
          text: 'Vue 3 SSR 深度解析：从原理到实战',
        },
        {
          link: 'vue/hooks',
          text: 'Hooks 深入解析：从 React 到 Vue 3',
        },
      ],
    },
    {
      collapsed: false,
      text: 'node.js',
      items: [
        {
          link: 'nodejs/introduction',
          text: 'Node.js 全面解析',
        },
        {
          link: 'nodejs/server',
          text: '服务器知识详解',
        },
        {
          link: 'nodejs/nodejs-qa',
          text: 'Node.js 面试常见问题汇总',
        },
      ],
    },
    {
      collapsed: false,
      text: '工程化',
      items: [
        {
          link: 'engineering/guide',
          text: '前端工程化深度解析与实践指南',
        },
        {
          link: 'engineering/monorepo',
          text: 'Monorepo 技术介绍',
        },
        {
          link: 'engineering/css',
          text: 'CSS 工程化系统介绍',
        },
        {
          link: 'engineering/project-code-management',
          text: '项目代码组织管理方案',
        },
      ],
    },
    {
      collapsed: false,
      text: '浏览器',
      items: [
        {
          link: 'browser/gc',
          text: '浏览器垃圾回收机制详解',
        },
        {
          link: 'browser/bytecode-v8',
          text: '理解V8引擎的字节码与解释执行',
        },
        {
          link: 'browser/bytecode-comparison',
          text: 'Java的字节码与V8的字节码',
        },
        {
          link: 'browser/java-bytecode-run',
          text: 'JVM对字节码的处理',
        },
        {
          link: 'browser/v8-bytecode-run',
          text: 'V8引擎字节码执行过程',
        },
      ],
    },
    {
      collapsed: false,
      text: '性能优化',
      items: [
        {
          link: 'performance/introduction',
          text: '前端性能优化的详细介绍',
        },
        {
          link: 'performance/indicator',
          text: '前端性能优化与监控',
        },
        {
          link: 'performance/api',
          text: 'PerformanceObserver 和 Performance API 的区别与应用场景',
        },
        {
          link: 'performance/qa',
          text: '前端性能优化常见问题',
        },
      ],
    },
    {
      collapsed: false,
      text: '其他',
      items: [
        {
          link: 'other/oop',
          text: '面向对象编程：深入理解与实践应用',
        },
        {
          link: 'other/fp',
          text: '函数式编程在前端开发中的应用与实践',
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
      text: '前端资料',
    },
    {
      link: '/course/lesson1_background/introduction',
      text: '项目课程',
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
