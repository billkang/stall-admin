# Project Rules

## 技术选型

- **Node.js**: v18+
- **Package Manager**: pnpm
- **Monorepo**: Turborepo (inferred)
- **Frontend**: Vue 3, Vite, TypeScript
- **Backend/Mock**: Nitro (inferred from `apps/backend-mock/nitro.config.ts`)
- **Documentation**: VitePress (inferred from `docs/.vitepress`)
- **Linting/Formatting**: ESLint, Prettier

## 命名规范

- 目录名：kebab-case
- 文件名：kebab-case (Vue 组件除外)
- Vue 组件：PascalCase 或 kebab-case (需统一)
- 变量/函数：camelCase
- 类/接口：PascalCase

## 模块结构

- `apps/`: 应用程序源码
- `internal/`: 内部工具库
- `docs/`: 文档

## 开发流程

- 使用 pnpm 进行依赖安装和脚本运行
- 遵循 Conventional Commits 规范
