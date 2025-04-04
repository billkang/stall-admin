# 基础概念

现在我们将会介绍一些基础概念，以便于你更好的理解整个文档。请务必仔细阅读这一部分。

## 大仓

大仓指的是整个项目的仓库，包含了所有的代码、包、应用、规范、文档、配置等，也就是一整个 `Monorepo` 目录的所有内容。

## 应用

应用指的是一个完整的项目，一个项目可以包含多个应用，这些项目可以复用大仓内的代码、包、规范等。应用都被放置在 `apps` 目录下。每个应用都是独立的，可以单独运行、构建、测试、部署，可以引入不同的组件库等等。

::: tip

应用不限于前端应用，也可以是后端应用、移动端应用等，例如 `apps/backend-mock`就是一个后端服务。

:::

## 包

包指的是一个独立的模块，可以是一个组件、一个工具、一个库等。包可以被多个应用引用，也可以被其他包引用。包都被放置在 `packages` 目录下。

对于这些包，你可以把它看作是一个独立的 `npm` 包，使用方式与 `npm` 包一样。

### 包引入

在 `package.json` 中引入包：

```json {3}
{
  "dependencies": {
    "@stall/utils": "workspace:*"
  }
}
```

### 包使用

在代码中引入包：

```ts
import { isString } from '@stall/utils';
```

## 别名

在项目中，你可以看到一些 `#` 开头的路径，例如： `#/api`、`#/views`, 这些路径都是别名，用于快速定位到某个目录。它不是通过 `vite` 的 `alias` 实现的，而是通过 `Node.js` 本身的 [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) 原理。只需要在 `package.json` 中配置 `imports` 字段即可。

```json {3}
{
  "imports": {
    "#/*": "./src/*"
  }
}
```

为了 IDE 能够识别这些别名，我们还需要在`tsconfig.json`内配置：

```json {5}
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "#/*": ["src/*"]
    }
  }
}
```

这样，你就可以在代码中使用别名了。
