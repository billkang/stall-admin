# Monorepo 技术实践指南

## 一、Monorepo 核心概念解析

### 1. 架构定义

Monorepo（单一代码仓库）是一种将多个相关项目或包统一存储在同一个版本控制仓库中的代码管理策略。典型应用场景包括但不限于：

- 多模块微服务架构体系
- 跨平台应用（Web/iOS/Android）
- 共享工具库集合
- 前后端一体化项目

### 2. 与传统仓库对比

| 维度            | Monorepo       | Polyrepo       |
|-----------------|----------------|----------------|
| 代码可见性       | 全量透明       | 隔离独立       |
| 依赖管理         | 统一版本控制   | 各自维护       |
| 跨项目修改       | 原子提交       | 多仓库同步     |
| CI/CD 复杂度     | 增量构建优化   | 独立流水线     |

## 二、Monorepo 的双刃剑特性

### 1. 核心优势矩阵

#### （1）依赖管理革命

- **依赖提升（Hoisting）**：通过共享 `node_modules` 减少重复安装。
- **版本锁定**：统一第三方库版本，避免钻石依赖问题。
- **跨包引用**：直接通过 workspace 协议进行本地依赖引用。

#### （2）开发效能提升

- **统一构建工具链**：如 ESLint/TypeScript/Jest 等。
- **原子提交保障代码一致性**：确保所有变更一次性提交。
- **跨项目重构可追溯性**：便于追踪重构影响范围。

#### （3）协作模式进化

- **统一代码规范与工程标准**。
- **集中式 issue 跟踪管理**。
- **全局版本发布策略**。

### 2. 潜在挑战清单

- 仓库膨胀风险：可能需要 Git LFS 支持。
- 权限管控困境：需精细化目录级访问控制。
- 构建性能瓶颈：建议采用增量构建策略。
- 工具链复杂度：配套开发 CI/CD 流水线和本地开发工具。
- IDE 性能压力：对内存和索引能力提出更高要求。

## 三、使用 pnpm + Turborepo 实现 Monorepo 的示例

### 1. 安装 pnpm 和 Turborepo

#### 安装 pnpm

全局安装 pnpm：

```bash
npm install -g pnpm
```

#### 初始化项目

创建一个新的项目目录 `my-monorepo`，并在根目录运行 `pnpm init` 创建 `package.json` 文件：

```bash
mkdir my-monorepo
cd my-monorepo
pnpm init
```

#### 创建项目结构

在根目录下创建 `packages` 文件夹，用于存储子包：

```bash
mkdir packages
```

在 `packages` 文件夹下创建两个子包 `package-a` 和 `package-b`：

```bash
mkdir packages/package-a
mkdir packages/package-b
```

#### 配置 pnpm 工作区

在根目录下创建 `pnpm-workspace.yaml` 文件，配置工作区：

```yaml
packages:
  - 'packages/*'
```

#### 安装依赖

在根目录下安装公共依赖，例如 `lodash`：

```bash
pnpm install lodash -w
```

在 `package-a` 中安装局部依赖，例如 `axios`：

```bash
cd packages/package-a
pnpm install axios
```

或者使用 `--filter` 参数安装：

```bash
pnpm install axios --filter package-a
```

#### 配置 Turborepo

在根目录下安装 Turborepo：

```bash
pnpm add turbo -D -w
```

在根目录下创建 `turbo.json` 配置文件：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

#### 配置任务

在 `package.json` 中添加脚本：

```json
"scripts": {
  "dev": "turbo run dev",
  "build": "turbo run build"
}
```

#### 示例项目结构

最终项目结构如下：

```bash
my-monorepo/
├── packages/
│   ├── package-a/
│   │   ├── package.json
│   │   ├── src/
│   │   │   └── index.js
│   │   └── tsconfig.json
│   └── package-b/
│       ├── package.json
│       ├── src/
│       │   └── index.js
│       └── tsconfig.json
├── pnpm-workspace.yaml
├── package.json
├── turbo.json
```

#### 开发和构建

在 `package-a` 中开发代码，修改 `src/index.js` 文件：

```javascript
// packages/package-a/src/index.js
export function add(a, b) {
  return a + b;
}
```

在 `package-b` 中开发代码，修改 `src/index.js` 文件：

```javascript
// packages/package-b/src/index.js
import { add } from '@my-monorepo/package-a';

export function subtract(a, b) {
  return a - b;
}

console.log(add(1, 2)); // 输出: 3
```

运行构建任务：

```bash
pnpm build
```

Turborepo 会优化构建流程，缓存构建结果，避免重复构建相同的内容，提高效率。

## 四、实施路线图建议

### 1. 适用场景判断

- 推荐采用场景：超过 3 个相互依赖的前端应用等。
- 不推荐场景：独立运营的 SaaS 产品等。

### 2. 渐进式迁移策略

1. 创建基础仓库架构。
2. 迁移核心共享库。
3. 建立 CI/CD 基线。
4. 增量迁移边缘服务。
5. 实施权限治理模型。

## 五、效能监控体系

建议建立以下度量指标：

- 依赖安装时间（冷/热启动）。
- 增量构建命中率。
- 跨包变更影响度。
- 代码冲突频率。
- 仓库膨胀速率。

通过 Prometheus + Grafana 构建可视化看板，设置阈值告警机制。

## 六、总结

Monorepo 技术为企业级开发提供了统一代码仓库的可能性，但也需要谨慎评估其适用性。对于新项目，推荐采用 pnpm + Turborepo 的组合，以及配套的 CI/CD 流水线和本地开发工具链。对于既有项目，采用双轨运行策略，逐步完成工具链切换。最终实现代码资产化、协作工业化、交付流水化的工程目标。

通过合理的架构设计、工具链适配、效能优化和团队协作，Monorepo 可以显著提升开发效率和项目质量，加速产品迭代和创新。
