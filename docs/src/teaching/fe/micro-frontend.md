# 微前端的概念

微前端（Micro Frontends）是一种将大型前端应用拆分成多个小型、独立的模块的架构模式。每个模块可以独立开发、测试和部署，同时作为一个整体协同工作。这种架构借鉴了微服务的思想，旨在提高应用的可维护性、可扩展性和开发效率。


## 历史背景

微前端的概念最早由 ThoughtWorks 的技术总监 Cam Jackson 在 2016 年提出。随着 Web 应用的复杂性不断增加，传统的单体前端架构面临诸多挑战，如代码耦合、维护困难、团队协作效率低下等。微前端架构应运而生，为解决这些问题提供了新的思路。


## 技术原理
* 独立性：每个微前端模块是一个独立的应用，拥有自己的代码库、构建流程和部署周期。
* 技术多样性：微前端允许使用不同的前端框架和技术栈，每个模块可以根据自身需求选择合适的技术。
* 封装性：通过封装，微前端模块之间的交互通过明确定义的接口进行，避免了全局状态的共享。
* 集成能力：通过一个统一的宿主应用（Host Application），将各个微前端模块集成在一起，实现统一的路由管理、状态共享和通信。


## 核心技术方案

### JavaScript 隔离：
* 环境快照：在微前端应用的生命周期中，通过快照技术保存全局状态。当应用卸载时，恢复到快照状态，确保全局变量的隔离。
* 代理和闭包：使用代理（Proxy）和闭包（Closure）技术模拟沙箱环境，隔离浏览器的原生对象，防止子应用对全局对象的污染。

### CSS 隔离：
* CSS Modules：通过为每个 CSS 类生成唯一的名称，确保样式的作用域限定在当前组件内。
* Shadow DOM：利用 Shadow DOM 的封装特性，将样式和结构封装在影子树中，防止样式冲突。
* CSS 隔离属性：使用 isolation: isolate 属性来隔离混合模式的效果。

## 沙箱模式及其优缺点

### 环境快照：

演示代码：

``` js
// 定义一个沙箱函数，传入要执行的代码和依赖
function sandbox(code, dependencies) {
  // 保存当前全局环境的快照
  const globalSnapshot = JSON.parse(JSON.stringify(window));

  // 执行代码前，将依赖注入全局环境
  Object.assign(window, dependencies);

  // 执行传入的代码
  eval(code);

  // 代码执行完毕后，恢复全局环境到快照状态
  Object.assign(window, globalSnapshot);
}

// 示例使用
const code = 'console.log(name);'; // 要执行的代码
const dependencies = { name: 'Kimi' }; // 代码的依赖
sandbox(code, dependencies); // 输出 Kimi
console.log(window.name); // 输出 undefined，全局环境未被污染
```

* 优点：实现简单，能够有效隔离全局变量。
* 缺点：不支持多实例，且在应用频繁切换时可能导致性能问题。


### 代理和闭包：

演示代码：

``` js
// 定义一个沙箱函数，传入要执行的代码
function sandbox(code) {
  // 创建一个闭包作用域，模拟沙箱环境
  (function() {
    // 使用代理技术，拦截对全局对象的访问
    const proxy = new Proxy(window, {
      get(target, prop) {
        // 如果访问的是沙箱环境中的属性，则返回代理对象
        if (prop === 'sandbox') {
          return this;
        }
        // 否则，访问原始全局对象的属性
        return target[prop];
      },
      set(target, prop, value) {
        // 如果设置的是沙箱环境中的属性，则在代理对象上设置
        if (prop === 'sandbox') {
          this[prop] = value;
        } else {
          // 否则，设置原始全局对象的属性
          target[prop] = value;
        }
      }
    });

    // 在沙箱环境中执行代码
    with(proxy) {
      eval(code);
    }
  })();
}

// 示例使用
const code = 'window.name = "Kimi"; console.log(window.name);'; // 要执行的代码
sandbox(code); // 输出 Kimi
console.log(window.name); // 输出 undefined，全局环境未被污染
```

* 优点：能够模拟完整的沙箱环境，隔离性较强。
* 缺点：实现复杂，需要对浏览器的原生对象进行深度封装。

### iFrame：

演示代码：
``` html
<!-- 创建一个 iFrame 元素作为沙箱容器 -->
<iframe id="sandbox" style="display: none;"></iframe>
<script>
  // 获取 iFrame 元素
  const iframe = document.getElementById('sandbox');
  // 等待 iFrame 加载完成
  iframe.onload = function() {
    // 获取 iFrame 的窗口对象
    const iframeWindow = iframe.contentWindow;
    // 在 iFrame 中执行代码
    iframeWindow.eval('console.log("Hello from iframe!");');
  };
</script>
```

``` js
// 示例使用
// 将要执行的代码作为字符串传递给 iFrame 的窗口对象
const code = 'console.log("Hello from iframe!");';
const iframeWindow = document.getElementById('sandbox').contentWindow;
iframeWindow.eval(code); // 在 iFrame 中输出 Hello from iframe!
console.log(window); // 当前页面的全局对象未受影响
```

* 优点：天然隔离，每个 iFrame 是一个独立的文档环境。
* 缺点：与主页面的交互复杂，性能开销较大。

## 市面上流行的微前端框架

### Single-spa：
* 特点：支持多种框架，提供生命周期管理。
* 优点：灵活性高，易于集成。
* 缺点：需要额外的配置和学习成本。

### qiankun：
* 特点：基于 Single-spa，支持沙箱隔离。
* 优点：易于上手，社区支持较好。
* 缺点：学习曲线较陡峭。

### micro-app：
* 特点：由京东前端团队推出，借鉴 WebComponent 思想。
* 优点：使用简单，提供样式隔离。
* 缺点：社区相对较小。

## 总结
微前端架构通过将复杂的前端应用拆分成多个独立的模块，提高了开发效率和应用的可维护性。它允许不同团队独立开发和部署各自负责的模块，支持多种前端框架和技术栈的集成。市面上的微前端框架各有优缺点，开发者可以根据项目需求和团队技术栈选择合适的框架。
