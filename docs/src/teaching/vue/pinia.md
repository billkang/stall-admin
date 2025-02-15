# Pinia 深度解析：核心技术原理与内部实现

Pinia 是 Vue 3 的官方推荐状态管理库，它在 Vuex 的基础上进行了优化与创新，极大地简化了 API 设计，并深度融合了 Vue 3 的 Composition API 和响应式系统特性。本文将深入剖析 Pinia 的核心技术原理，并基于其源代码给出详细的简化版内部实现。

---

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

## 二、简化版 Pinia 内部实现

为了更深入理解 Pinia 的工作机制，下面我们将基于其源码解析 Pinia 的核心实现细节，并提供相应的简化版代码示例。

### 1. 基础架构

```javascript
export function defineStore(id, setup, setupOptions) {
  let options = setupOptions || setup;

  function useStore(pinia = null) {
    const hasContext = hasInjectionContext();
    pinia = hasContext ? inject(piniaSymbol, null) : pinia || getActivePinia();

    if (!pinia) {
      throw new Error();
    }

    if (!pinia._s.has(id)) {
      if (typeof setup === 'function') {
        createSetupStore(id, setup, options, pinia);
      } else {
        createOptionsStore(id, options, pinia);
      }
    }

    const store = pinia._s.get(id);
    return store;
  }

  useStore.$id = id;
  return useStore;
}

function createOptionsStore(id, options, pinia) {
  const { state, actions, getters } = options;

  // Initialize the state in the Pinia instance
  if (!pinia.state.value[id]) {
    pinia.state.value[id] = state ? state() : {};
  }

  // Create the store using the setup function
  const store = createSetupStore(id, () => {
    const localState = toRefs(pinia.state.value[id]);
    const computedGetters = Object.keys(getters || {}).reduce((computedGetters, name) => {
      computedGetters[name] = computed(() => {
        setActivePinia(pinia);
        const store = pinia._s.get(id);
        return getters[name].call(store, store);
      });
      return computedGetters;
    }, {});

    return assign(localState, actions, computedGetters);
  }, options, pinia);

  return store;
}

function createSetupStore($id, setup, options = {}, pinia, isOptionsStore = false) {
  let scope;

  const optionsForPlugin = Object.assign({ actions: {} }, options);

  const $subscribeOptions = { deep: true };

  let isListening; // set to true at the end
  let isSyncListening; // set to true at the end
  let subscriptions = [];
  let actionSubscriptions = [];
  let debuggerEvents;
  const initialState = pinia.state.value[$id];

  if (!isOptionsStore && !initialState) {
    pinia.state.value[$id] = {};
  }

  const hotState = { value: {} };

  let activeListener;
  function $patch(partialStateOrMutator) {
    let subscriptionMutation;
    isListening = isSyncListening = false;

    if (typeof partialStateOrMutator === 'function') {
      partialStateOrMutator(pinia.state.value[$id]);
      subscriptionMutation = {
        type: 'patchFunction',
        storeId: $id,
        events: debuggerEvents
      };
    } else {
      mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
      subscriptionMutation = {
        type: 'patchObject',
        payload: partialStateOrMutator,
        storeId: $id,
        events: debuggerEvents
      };
    }

    const myListenerId = (activeListener = Symbol());
    nextTick().then(() => {
      if (activeListener === myListenerId) {
        isListening = true;
      }
    });

    isSyncListening = true;
    triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
  }

  const $reset = isOptionsStore
    ? function $reset() {
        const { state } = options;
        const newState = state ? state() : {};
        this.$patch(($state) => {
          Object.assign($state, newState);
        });
      }
    : function noop() {};

  function $dispose() {
    scope.stop();
    subscriptions = [];
    actionSubscriptions = [];
    pinia._s.delete($id);
  }

  function action(fn, name = '') {
    if (ACTION_MARKER in fn) {
      fn[ACTION_NAME] = name;
      return fn;
    }

    const wrappedAction = function () {
      setActivePinia(pinia);
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
        onError
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
    _p: pinia,
    $id,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $patch,
    $reset,
    $subscribe(callback, options = {}) {
      const removeSubscription = addSubscription(
        subscriptions,
        callback,
        options.detached,
        () => stopWatcher()
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
                  events: debuggerEvents
                },
                state
              );
            }
          },
          Object.assign({}, $subscribeOptions, options)
        )
      );

      return removeSubscription;
    },
    $dispose
  };

  const store = reactive(partialStore);

  pinia._s.set($id, store);

  const runWithContext = (pinia._a && pinia._a.runWithContext) || fallbackRunWithContext;

  const setupStore = runWithContext(() =>
    pinia._e.run(() => (scope = effectScope()).run(() => setup({ action })))
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

  Object.assign(store, setupStore);
  Object.assign(toRaw(store), setupStore);

  Object.defineProperty(store, '$state', {
    get: () => (pinia.state.value[$id]),
    set: (state) => {
      $patch(($state) => {
        Object.assign($state, state);
      });
    }
  });

  pinia._p.forEach((extender) => {
    Object.assign(store, scope.run(() =>
      extender({
        store,
        app: pinia._a,
        pinia,
        options: optionsForPlugin
      })
    ));
  });

  if (
    initialState &&
    isOptionsStore &&
    options.hydrate
  ) {
    options.hydrate(store.$state, initialState);
  }

  isListening = true;
  isSyncListening = true;
  return store;
}
```

**说明：**

- `defineStore` 函数用于定义一个新的 Store。
- 使用 `effectScope` 来确保所有副作用都在同一个作用域内运行，方便清理。
- `$reset` 方法用于重置 Store 到初始状态。

### 2. 使用 Store

为了让组件能够方便地使用 Store，我们提供了 `useStore` 函数。

```javascript
function useStore(pinia = null) {
  const hasContext = hasInjectionContext();
  pinia = hasContext ? inject(piniaSymbol, null) : pinia || getActivePinia();

  if (!pinia) {
    throw new Error();
  }

  if (!pinia._s.has(id)) {
    if (typeof setup === 'function') {
      createSetupStore(id, setup, options, pinia);
    } else {
      createOptionsStore(id, options, pinia);
    }
  }

  const store = pinia._s.get(id);
  return store;
}
```

### 3. State、Getters 和 Actions 示例

```javascript
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  getters: {
    doubleCount(state) {
      return state.count * 2;
    }
  },
  actions: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    }
  }
});
```

### 4. 插件机制

Pinia 支持插件，可以通过插件扩展 Store 的功能。插件是一个函数，接收 Store 作为参数，并可以对其进行修改或添加额外的功能。

```javascript
// 创建 Pinia 实例并应用插件
export function createPinia() {
  const scope = effectScope(true);
  const state = scope.run(() => ref({}))!;

  let _p = [];
  let toBeInstalled = [];

  const pinia = {
    install(app) {
      setActivePinia(pinia);
      pinia._a = app;
      app.provide(piniaSymbol, pinia);
      app.config.globalProperties.$pinia = pinia;

      toBeInstalled.forEach(plugin => _p.push(plugin));
      toBeInstalled = [];
    },

    use(plugin) {
      if (!this._a) {
        toBeInstalled.push(plugin);
      } else {
        _p.push(plugin);
      }
      return this;
    },

    _p,
    _a: null,
    _e: scope,
    _s: new Map(),
    state,
  };

  return pinia;
}
```

### 5. 创建 Pinia 实例

最后，我们需要创建一个 Pinia 实例，并将其挂载到 Vue 应用上。

```javascript
import { createApp } from 'vue';
import { createPinia } from './pinia'; // 自定义 Pinia 实现
import App from './App.vue';

const pinia = createPinia();
pinia.use(persistPlugin);

const app = createApp(App);
app.use(pinia);
app.mount('#app');
```

---

## 三、总结与高级特性

Pinia 的设计哲学是保持简单的同时提供强大的功能，这使得它成为 Vue 3 开发者的理想选择之一。除了上述基础实现外，Pinia 还包括以下高级特性和优化：

1. **热重载支持**：开发期间，Pinia 支持热重载功能，这意味着当 Store 的代码发生变化时，无需刷新整个页面，Store 就能自动更新。
2. **类型推断**：Pinia 与 TypeScript 集成良好，提供了强大的类型推断能力，有助于减少错误，提高代码的可维护性和可读性。
3. **调试工具集成**：Pinia 与 Vue Devtools 紧密集成，开发者可以在 Vue Devtools 中方便地监控和调试 Store 状态的变化。
4. **命名空间**：Pinia 支持嵌套 Store 结构，通过命名空间的方式使得大型应用的状态管理更加易于组织和维护。
5. **组合多个 Store**：Pinia 允许将多个 Store 的状态合并到一起使用，这对于某些场景下非常有用。

通过深入了解 Pinia 的核心原理和内部实现，开发者能够更好地运用它来构建高质量的 Vue 应用。希望这篇指南不仅帮助你理解了 Pinia 的基本工作流程，也为你在实际项目中应用 Pinia 提供了有价值的参考。
