# Vue 3 渲染原理

Vue 3 的渲染原理核心是 虚拟 DOM（Virtual DOM）、响应式系统（Reactive System）和 Diffing 算法（Diffing Algorithm）。通过虚拟 DOM 和高效的更新策略，Vue 3 实现了对 UI 的高效渲染、更新和性能优化。同时，响应式系统使得数据的变化可以自动驱动视图更新。

## 核心概念

### 1. 虚拟 DOM（Virtual DOM）

Vue 通过虚拟 DOM 来减少对真实 DOM 的直接操作，所有 UI 的变动都通过虚拟 DOM 进行抽象，并且在必要时同步到真实 DOM。

### 2. 响应式系统（Reactive System）

Vue 3 引入了基于 Proxy 的响应式机制，当数据变化时，框架会自动追踪数据依赖，触发视图的更新。

### 3. Diffing 算法

在更新视图时，Vue 3 会将新旧虚拟 DOM 进行比较（Diffing），找出最小的差异并应用到真实 DOM 中，从而避免不必要的 DOM 更新。

## 渲染过程

### 1. 创建虚拟节点

通过 createVNode 函数构建虚拟节点，虚拟节点描述了 UI 的结构，包括节点类型、属性和子节点。

### 2. 响应式数据绑定

数据通过 reactive 函数代理，使得数据变化时可以通知相关依赖（虚拟 DOM）进行更新。

### 3. 渲染虚拟 DOM 到真实 DOM

通过递归渲染虚拟节点到真实 DOM 中，确保 UI 与数据保持同步。

### 4. Diffing 更新

当数据发生变化时，新的虚拟 DOM 会与旧的虚拟 DOM 进行比较，找出差异并进行最小化的 DOM 更新。

## Vue 3 渲染原理的核心代码实现

### 1. 创建虚拟节点

虚拟节点是用来描述 UI 的轻量级表示：

``` javascript
function createVNode(tag, props, children) {
  return { tag, props, children };
}
```

### 2. 响应式数据代理

Vue 3 使用 Proxy 实现响应式机制，当数据变化时，自动触发更新：

``` javascript
function reactive(obj) {
  const depMap = new Map(); // 每个属性都对应一个 Dep 实例

  const handlers = {
    get(target, key) {
      if (!depMap.has(key)) {
        depMap.set(key, new Dep());
      }

      const dep = depMap.get(key);

      // 收集依赖
      if (Dep.target) {
        dep.addDep(Dep.target);
      }

      return Reflect.get(target, key);
    },
    set(target, key, value) {
      const result = Reflect.set(target, key, value);

      // 通知更新
      if (depMap.has(key)) {
        const dep = depMap.get(key);
        dep.notify();
      }

      return result;
    }
  };

  return new Proxy(obj, handlers);
}
```

### 3. 依赖收集和通知机制

Dep 是一个依赖收集器，用于追踪数据的变化并通知视图更新：

``` javascript
class Dep {
  constructor() {
    this.deps = new Set(); // 存储所有依赖
  }

  addDep(dep) {
    this.deps.add(dep); // 添加依赖
  }

  notify() {
    this.deps.forEach(dep => dep()); // 通知所有依赖更新
  }
}

Dep.target = null; // 存储当前激活的依赖
```

### 4. 渲染虚拟 DOM 到真实 DOM

渲染函数将虚拟节点转化为真实的 DOM 元素：

``` javascript
function render(vnode, container) {
  const el = document.createElement(vnode.tag);

  // 设置属性
  for (const key in vnode.props) {
    el.setAttribute(key, vnode.props[key]);
  }

  // 渲染子节点
  vnode.children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child)); // 文本节点
    } else {
      render(child, el); // 递归渲染子节点
    }
  });

  container.appendChild(el);
}
```

### 5. 依赖收集和响应式更新

在渲染函数中，设置 Dep.target，使访问响应式数据时能够收集依赖。

``` javascript
复制代码
function watchEffect(effect) {
  Dep.target = effect; // 设置当前依赖
  effect();            // 执行依赖函数，触发 getter
  Dep.target = null;   // 重置依赖
}
```

### 6. Diffing 算法

Diffing 算法比较新旧虚拟节点，更新必要的 DOM 元素：

``` javascript
function diff(oldVNode, newVNode, container) {
  // 如果没有旧节点，直接渲染新节点
  if (!oldVNode) {
    render(newVNode, container);
  }
  // 如果没有新节点，移除旧节点
  else if (!newVNode) {
    container.removeChild(container.firstChild);
  }
  // 如果节点类型不同，直接替换节点
  else if (oldVNode.tag !== newVNode.tag) {
    container.replaceChild(render(newVNode, document.createElement('div')), container.firstChild);
  }
  // 如果节点相同，更新属性和子节点
  else {
    const el = container.firstChild;

    // 更新属性
    for (const key in newVNode.props) {
      el.setAttribute(key, newVNode.props[key]);
    }

    // 递归对子节点进行 Diffing
    const maxLength = Math.max(oldVNode.children.length, newVNode.children.length);
    for (let i = 0; i < maxLength; i++) {
      diff(oldVNode.children[i], newVNode.children[i], el);
    }
  }
}
```

### 7. 响应式数据和视图更新

当响应式数据发生变化时，视图会自动更新。以下是一个简单的例子：

``` javascript
// 响应式数据
const state = reactive({
  message: 'Hello, Vue 3!',
  count: 0
});

// 创建虚拟 DOM
function createApp() {
  return createVNode('div', { id: 'app' }, [
    createVNode('h1', {}, [state.message]),
    createVNode('p', {}, [`Count: ${state.count}`])
  ]);
}

// 渲染器
const container = document.getElementById('root');
let oldVNode = null;

// 依赖响应式数据
watchEffect(() => {
  const newVNode = createApp();
  diff(oldVNode, newVNode, container); // 比较新旧虚拟 DOM，更新视图
  oldVNode = newVNode;
});

// 模拟数据变化
setInterval(() => {
  state.count++;
}, 1000);
```

## 总结

Vue 3 的渲染原理基于以下几个核心组件：

* 虚拟 DOM：通过虚拟 DOM 描述 UI，使得每次渲染只更新最小的差异部分，从而提升性能。
* 响应式系统：基于 Proxy 实现数据的自动追踪和更新，使得视图与数据保持同步。
* Diffing 算法：通过高效的虚拟 DOM 比较算法，确保 UI 更新时仅执行最小量的 DOM 操作。

通过这种设计，Vue 3 能够高效地更新视图，同时支持响应式编程和跨平台开发。
