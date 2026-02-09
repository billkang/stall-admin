# Pinia 深度解析：核心技术原理与内部实现

Pinia 是 Vue 3 的官方推荐状态管理库，它在 Vuex 的基础上进行了优化与创新，极大地简化了 API 设计，并深度融合了 Vue 3 的 Composition API 和响应式系统特性。本文将深入剖析 Pinia 的核心技术原理，并基于其源代码给出详细的简化版内部实现。

## 一、核心概念

### 1. Store

每个 Store 都代表一个独立的状态模块，它是 Pinia 管理应用状态的基本单元。在一个大型应用中，可以根据业务模块划分不同的 Store，例如用户相关的状态可以放在 `userStore` 中，购物车相关状态放在 `cartStore` 中。每个 Store 内部包含了 `state`（状态）、`getters`（计算属性）、`actions`（方法）等关键部分，这些部分协同工作，使得状态管理更加模块化、可维护。

### 2. State

State 用于存储应用的状态数据，通过 Vue 3 的 `ref` 或 `reactive` 函数创建，从而具备响应式特性。这意味着，当 State 中的数据发生变化时，Vue 会自动检测到并更新与之绑定的 DOM 元素。

### 3. Getters

Getters 类似于 Vue 组件中的计算属性，它们基于 State 派生而来。与普通函数不同，Getters 具有缓存机制，只有当它依赖的 State 发生变化时才会重新计算。这一特性在需要对 State 进行复杂计算或多次使用相同计算结果时非常有用，可以提高性能。

### 4. Actions

Actions 用于处理业务逻辑，它可以是同步的，也可以是异步的。Actions 可以修改 State，发起网络请求，调用其他 Actions 等。例如，在一个用户登录功能中，我们可以在 Action 中发起登录请求，并在请求成功后修改用户登录状态的 State。

### 5. Plugins

Plugins 是 Pinia 提供的插件机制，允许开发者扩展 Pinia 的功能。通过插件，我们可以实现诸如状态持久化、日志记录、错误处理等通用功能，而无需在每个 Store 中重复编写代码。插件的应用使得 Pinia 的扩展性大大增强，能够更好地适应不同项目的需求。

---

## 二、Pinia 核心代码

为了更深入理解 Pinia 的工作机制，下面我们将基于其源码解析 Pinia 的核心实现细节，并提供相应的简化版代码示例。

### 1. 定义 createPinia

```javascript
export function createPinia() {
  // 创建一个 effectScope，用于管理响应式状态
  const scope = effectScope(true);

  // 创建一个响应式的 state 对象，用于存储所有 store 的状态
  const state = scope.run(() => ref({})) || {};

  // 存储插件列表
  let _p = [];
  // 在调用 app.use(pinia) 之前添加的插件
  let toBeInstalled = [];

  // 创建 Pinia 实例
  const pinia = {
    install(app) {
      // 允许在组件外部调用 useStore()
      setActivePinia(pinia);
      pinia._a = app; // 将 Vue 应用实例存储在 Pinia 中
      app.provide(piniaSymbol, pinia); // 将 Pinia 实例提供给 Vue 应用
      app.config.globalProperties.$pinia = pinia; // 在全局属性中添加 $pinia

      // 将待安装的插件添加到插件列表中
      toBeInstalled.forEach((plugin) => _p.push(plugin));
      toBeInstalled = []; // 清空待安装插件列表
    },

    use(plugin) {
      // 如果 Pinia 尚未安装到 Vue 应用中
      if (!this._a) {
        toBeInstalled.push(plugin); // 将插件添加到待安装列表
      } else {
        _p.push(plugin); // 将插件添加到插件列表
      }
      return this;
    },

    _p, // 插件列表
    _a: null, // Vue 应用实例（初始值为 null）
    _e: scope, // effectScope 实例
    _s: new Map(), // 存储所有 store 的 Map
    state, // 存储所有 store 状态的响应式对象
  };

  return pinia; // 返回 Pinia 实例
}
```

#### 代码注释

##### 1. 创建响应式状态

```JavaScript
const scope = effectScope(true); // 创建一个 effectScope
const state = scope.run(() => ref({})) || {}; // 创建一个响应式的 state 对象
```

- 使用 effectScope 创建一个独立的作用域，用于管理 Pinia 的响应式状态。
- state 是一个响应式对象，用于存储所有 store 的状态。

##### 2. 插件管理

```JavaScript
let _p = []; // 存储已安装的插件
let toBeInstalled = []; // 存储在安装 Pinia 之前添加的插件
```

- \_p 用于存储已安装的插件。
- toBeInstalled 用于存储在调用 app.use(pinia) 之前添加的插件。

##### 3. install 方法

```JavaScript
install(app) {
    setActivePinia(pinia); // 设置当前 Pinia 实例
    pinia._a = app; // 将 Vue 应用实例存储在 Pinia 中
    app.provide(piniaSymbol, pinia); // 将 Pinia 实例提供给 Vue 应用
    app.config.globalProperties.$pinia = pinia; // 在全局属性中添加 $pinia

    toBeInstalled.forEach(plugin => _p.push(plugin)); // 将待安装的插件添加到插件列表
    toBeInstalled = []; // 清空待安装插件列表
}
```

- install 方法用于将 Pinia 实例安装到 Vue 应用中。
- 它将 Pinia 实例提供给 Vue 应用，并注册开发工具（如果启用）。
- 它还将待安装的插件添加到插件列表中。

##### 4. use 方法

```JavaScript
use(plugin) {
    if (!this._a) {
        toBeInstalled.push(plugin); // 如果 Pinia 尚未安装，则将插件添加到待安装列表
    } else {
        _p.push(plugin); // 如果 Pinia 已安装，则直接添加到插件列表
    }
    return this;
}
```

- use 方法用于添加插件。
- 如果 Pinia 尚未安装到 Vue 应用中，则将插件添加到 toBeInstalled 列表中。
- 如果 Pinia 已安装，则直接将插件添加到 \_p 列表中。

##### 总结

createPinia 函数用于创建一个 Pinia 实例。它初始化了响应式状态、插件列表，并提供了 install 和 use 方法用于将 Pinia 安装到 Vue 应用中和添加插件。此外，它还支持开发工具的自动加载，以便在开发环境中调试状态。

### 2. 定义 defineStore

#### 2.1 defineStore 函数

```javascript
export function defineStore(id, setup, setupOptions) {
  // 如果 setupOptions 未提供，则将 setup 视为 options
  let options = setupOptions || setup;

  function useStore(pinia = null) {
    // 检查是否处于 Vue 的上下文中
    const hasContext = hasInjectionContext();
    // 尝试从上下文中注入 Pinia 实例，如果没有则使用全局的 Pinia 实例
    pinia = hasContext ? inject(piniaSymbol, null) : pinia || getActivePinia();

    if (!pinia) {
      throw new Error('Pinia instance not found');
    }

    // 如果 Pinia 实例中尚未注册该 store，则创建它
    if (!pinia._s.has(id)) {
      if (typeof setup === 'function') {
        // 如果 setup 是函数，则调用 createSetupStore 创建 store
        createSetupStore(id, setup, options, pinia);
      } else {
        // 如果 setup 是对象，则调用 createOptionsStore 创建 store
        createOptionsStore(id, options, pinia);
      }
    }

    // 从 Pinia 实例中获取并返回 store
    const store = pinia._s.get(id);
    return store;
  }

  // 为 useStore 函数添加 $id 属性，用于标识 store 的 ID
  useStore.$id = id;
  return useStore;
}
```

##### 功能

defineStore 是定义 Pinia store 的入口函数。它根据传入的 setup 参数类型（函数或对象）决定使用哪种方式创建 store。

##### 参数

- id：store 的唯一标识符。
- setup：可以是函数或对象，定义 store 的逻辑。
- setupOptions：可选参数，用于传递额外的配置。

##### 返回值

返回一个 useStore 函数，用于在组件中使用该 store。

#### 2.2 createOptionsStore 函数

```javascript
function createOptionsStore(id, options, pinia) {
  const { state, actions, getters } = options;

  // 初始化 state
  if (!pinia.state.value[id]) {
    pinia.state.value[id] = state ? state() : {};
  }

  // 使用 setup 函数创建 store
  const store = createSetupStore(
    id,
    () => {
      const localState = toRefs(pinia.state.value[id]);

      // 将 getters 转换为 computed 属性
      const computedGetters = Object.keys(getters || {}).reduce(
        (computedGetters, name) => {
          computedGetters[name] = computed(() => {
            setActivePinia(pinia); // 设置当前 Pinia 实例
            const store = pinia._s.get(id); // 获取 store
            return getters[name].call(store, store); // 调用 getter 函数
          });
          return computedGetters;
        },
        {},
      );

      // 合并 localState、actions 和 computedGetters
      return assign(localState, actions, computedGetters);
    },
    options,
    pinia,
  );

  return store;
}
```

##### 功能

createOptionsStore 是一种基于选项式 API 的 store 创建方式。它将 state、actions 和 getters 转换为响应式对象，并通过 createSetupStore 创建 store。

##### 参数

- id：store 的唯一标识符。
- options：包含 state、actions 和 getters 的配置对象。
- pinia：Pinia 实例。

##### 返回值

返回创建的 store。

#### 2.3 createSetupStore 函数

##### 完整版代码

```javascript
function createSetupStore(
  $id,
  setup,
  options = {},
  pinia,
  isOptionsStore = false,
) {
  let scope;

  const optionsForPlugin = Object.assign({ actions: {} }, options);

  const $subscribeOptions = { deep: true };

  let isListening = false; // 是否正在监听状态变化
  let isSyncListening = false; // 是否正在同步监听状态变化
  let subscriptions = []; // 状态变化订阅列表
  let actionSubscriptions = []; // 动作订阅列表
  let debuggerEvents; // 调试事件
  const initialState = pinia.state.value[$id]; // 初始状态

  if (!isOptionsStore && !initialState) {
    pinia.state.value[$id] = {}; // 初始化状态
  }

  let activeListener; // 当前监听器

  function $patch(partialStateOrMutator) {
    let subscriptionMutation;
    isListening = isSyncListening = false;

    if (typeof partialStateOrMutator === 'function') {
      partialStateOrMutator(pinia.state.value[$id]); // 如果是函数，则调用它更新状态
      subscriptionMutation = {
        type: 'patchFunction',
        storeId: $id,
        events: debuggerEvents,
      };
    } else {
      mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator); // 合并状态
      subscriptionMutation = {
        type: 'patchObject',
        payload: partialStateOrMutator,
        storeId: $id,
        events: debuggerEvents,
      };
    }

    const myListenerId = (activeListener = Symbol());
    nextTick().then(() => {
      if (activeListener === myListenerId) {
        isListening = true;
      }
    });

    isSyncListening = true;
    triggerSubscriptions(
      subscriptions,
      subscriptionMutation,
      pinia.state.value[$id],
    ); // 触发订阅回调
  }

  const $reset = isOptionsStore
    ? function $reset() {
        const { state } = options;
        const newState = state ? state() : {};
        this.$patch(($state) => {
          Object.assign($state, newState); // 重置状态
        });
      }
    : function noop() {};

  function $dispose() {
    scope.stop(); // 停止监听
    subscriptions = [];
    actionSubscriptions = [];
    pinia._s.delete($id); // 从 Pinia 实例中删除 store
  }

  function action(fn, name = '') {
    // 包装动作函数
    const wrappedAction = function () {
      setActivePinia(pinia); // 设置当前 Pinia 实例
      const args = Array.from(arguments);

      const afterCallbackList = [];
      const onErrorCallbackList = [];

      function after(callback) {
        afterCallbackList.push(callback);
      }

      function onError(callback) {
        onErrorCallbackList.push(callback);
      }

      triggerSubscriptions(actionSubscriptions, {
        args,
        name: wrappedAction[ACTION_NAME],
        store,
        after,
        onError,
      });

      let ret;
      try {
        ret = fn.apply(this && this.$id === $id ? this : store, args);
      } catch (error) {
        triggerSubscriptions(onErrorCallbackList, error);
        throw error;
      }

      if (ret instanceof Promise) {
        return ret
          .then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          })
          .catch((error) => {
            triggerSubscriptions(onErrorCallbackList, error);
            return Promise.reject(error);
          });
      }

      triggerSubscriptions(afterCallbackList, ret);
      return ret;
    };

    wrappedAction[ACTION_MARKER] = true;
    wrappedAction[ACTION_NAME] = name;
    return wrappedAction;
  }

  const partialStore = {
    _p: pinia, // Pinia 实例
    $id, // store 的 ID
    $onAction: addSubscription.bind(null, actionSubscriptions), // 添加动作订阅
    $patch, // 更新状态
    $reset, // 重置状态
    $subscribe(callback, options = {}) {
      const removeSubscription = addSubscription(
        subscriptions,
        callback,
        options.detached,
        () => stopWatcher(),
      );

      const stopWatcher = scope.run(() =>
        watch(
          () => pinia.state.value[$id],
          (state) => {
            if (options.flush === 'sync' ? isSyncListening : isListening) {
              callback(
                {
                  storeId: $id,
                  type: 'direct',
                  events: debuggerEvents,
                },
                state,
              );
            }
          },
          Object.assign({}, $subscribeOptions, options),
        ),
      );

      return removeSubscription;
    },
    $dispose, // 销毁 store
  };

  const store = reactive(partialStore); // 将 store 转换为响应式对象

  pinia._s.set($id, store); // 将 store 添加到 Pinia 实例中

  const runWithContext =
    (pinia._a && pinia._a.runWithContext) || fallbackRunWithContext;

  const setupStore = runWithContext(() =>
    pinia._e.run(() => (scope = effectScope()).run(() => setup({ action }))),
  );

  for (const key in setupStore) {
    const prop = setupStore[key];

    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      if (!isOptionsStore) {
        if (initialState && shouldHydrate(prop)) {
          if (isRef(prop)) {
            prop.value = initialState[key];
          } else {
            mergeReactiveObjects(prop, initialState[key]);
          }
        }
        pinia.state.value[$id][key] = prop;
      }
    } else if (typeof prop === 'function') {
      const actionValue = action(prop, key);
      setupStore[key] = actionValue;
    }
  }

  Object.assign(store, setupStore); // 合并 setup 返回的属性
  Object.assign(toRaw(store), setupStore); // 合并原始对象

  Object.defineProperty(store, '$state', {
    get: () => pinia.state.value[$id], // 获取状态
    set: (state) => {
      $patch(($state) => {
        Object.assign($state, state); // 更新状态
      });
    },
  });

  pinia._p.forEach((extender) => {
    Object.assign(
      store,
      scope.run(() =>
        extender({
          store,
          app: pinia._a,
          pinia,
          options: optionsForPlugin,
        }),
      ),
    );
  });

  isListening = true;
  isSyncListening = true;
  return store;
}
```

##### 简化后代码

```js
function createSetupStore(id, setup, options, pinia) {
  // 初始化状态
  if (!pinia.state.value[id]) {
    pinia.state.value[id] = {};
  }

  // 创建响应式 store
  const store = reactive({
    $id: id,
    $patch: (stateUpdate) => {
      if (typeof stateUpdate === 'function') {
        stateUpdate(pinia.state.value[id]);
      } else {
        Object.assign(pinia.state.value[id], stateUpdate);
      }
    },
    $reset: () => {
      const { state } = options;
      const newState = state ? state() : {};
      Object.assign(pinia.state.value[id], newState);
    },
    $dispose: () => {
      pinia._s.delete(id);
    },
  });

  // 执行 setup 函数
  const setupResult = setup({});

  // 合并 setup 的结果到 store
  Object.assign(store, setupResult);

  // 将 store 添加到 Pinia 实例中
  pinia._s.set(id, store);

  return store;
}
```

##### 功能

createSetupStore 是 Pinia 的核心实现，用于创建一个响应式的 store。它支持状态更新、订阅回调、动作处理等功能。

##### 参数

- $id：store 的唯一标识符。
- setup：定义 store 的逻辑。
- options：可选配置。
- pinia：Pinia 实例。
- isOptionsStore：是否为选项式 API 创建的 store。

##### 返回值

返回创建的 store。

##### 关键点

1. 响应式状态管理：
   - 使用 Vue 的 reactive 和 watch API，确保状态的响应式更新。
2. 状态更新：
   - $patch 方法支持通过函数或对象更新状态，并触发订阅回调。
3. 动作处理：
   - 动作被包装为响应式函数，支持异步操作和错误处理。
4. 订阅机制：
   - 支持状态变化和动作的订阅，允许开发者在状态更新时执行自定义逻辑。
5. 插件支持：
   - 通过 pinia.\_p 遍历插件，允许插件扩展 store 的功能。
6. 热更新支持：
   - 提供 hotState，支持热更新功能。

##### 使用场景

1. 定义全局状态：
   - 使用 defineStore 定义全局状态，便于在 Vue 组件中使用。
2. 响应式状态更新：
   - 使用 $patch 方法更新状态，确保状态的响应式更新。
3. 动作处理：
   - 使用 $onAction 监听动作，执行自定义逻辑。
4. 插件扩展：
   - 使用插件扩展 Pinia 的功能，例如持久化状态或调试工具。
5. 热更新：
   - 支持开发过程中的热更新，提高开发效率。

## 三、使用pinia

### 1. 创建 Pinia 实例

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
const pinia = createPinia();

const app = createApp(App);
app.use(pinia);
app.mount('#app');
```

### 2. 创建store

```javascript
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  getters: {
    doubleCount(state) {
      return state.count * 2;
    },
  },
  actions: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
  },
});
```

### 3. 使用store

```vue
<template>
  <p>count: {{ count }}</p>
  <p>double count: {{ doubleCount }}</p>
  <button @click="() => increment()">+1</button>
  <button @click="() => decrement()">-1</button>
</template>

<script setup lang="ts">
import { useCounterStore } from '../src/store/user';
const store = useCounterStore();
const { count, doubleCount, increment, decrement } = store;
</script>
```

## 四、总结与高级特性

Pinia 的设计哲学是保持简单的同时提供强大的功能，这使得它成为 Vue 3 开发者的理想选择之一。除了上述基础实现外，Pinia 还包括以下高级特性和优化：

1. **热重载支持**：开发期间，Pinia 支持热重载功能，这意味着当 Store 的代码发生变化时，无需刷新整个页面，Store 就能自动更新。
2. **类型推断**：Pinia 与 TypeScript 集成良好，提供了强大的类型推断能力，有助于减少错误，提高代码的可维护性和可读性。
3. **调试工具集成**：Pinia 与 Vue Devtools 紧密集成，开发者可以在 Vue Devtools 中方便地监控和调试 Store 状态的变化。
4. **命名空间**：Pinia 支持嵌套 Store 结构，通过命名空间的方式使得大型应用的状态管理更加易于组织和维护。
5. **组合多个 Store**：Pinia 允许将多个 Store 的状态合并到一起使用，这对于某些场景下非常有用。

通过深入了解 Pinia 的核心原理和内部实现，开发者能够更好地运用它来构建高质量的 Vue 应用。希望这篇指南不仅帮助你理解了 Pinia 的基本工作流程，也为你在实际项目中应用 Pinia 提供了有价值的参考。
