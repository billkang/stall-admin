## 简介

Stall-Admin 作为一个免费开源的中后台模板，它采用了最新的 Vue 3、Vite、TypeScript 等主流技术开发，开箱即用，可用于中后台前端开发，也适合学习参考。

## 特性

- **最新技术栈**：使用 Vue3/vite 等前端前沿技术开发
- **TypeScript**: 应用程序级 JavaScript 的语言
- **主题**：提供多套主题色彩，可配置自定义主题
- **国际化**：内置完善的国际化方案
- **权限** 内置完善的动态路由权限生成方案

测试账号:

stall/123456

admin/123456

jack/123456

## 安装使用

- 安装依赖

1. 安装nodejs

进去nodejs官网 https://nodejs.org/zh-cn，下载LTS版本进行安装。

2. 打开cmd命令行工具，安装pnpm

```bash
npm install -g pnpm
```

3. 进入项目目录，安装依赖

```bash
cd stall-admin

corepack enable

pnpm install
```

- 运行

1. 运行项目

```bash
pnpm run dev
```

2. 运行文档站

```bash
pnpm run dev:docs
```

- 打包

```bash
pnpm build
```
