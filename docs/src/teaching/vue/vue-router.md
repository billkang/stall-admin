### Vue Router 深度解析与实现原理

Vue Router 是 Vue.js 官方的路由管理器，它使构建单页应用（SPA）变得更加简单。本文将系统地介绍 Vue Router 4 的核心概念、工作流程及其相关原理，并附上关键示例代码帮助理解。

## 一、Vue Router 核心概念

1. **`createRouterMatcher`**: 管理和匹配路由规则。
2. **`createRouter`**: 创建一个新的路由器实例。
3. **`RouterView`**: 动态渲染匹配到的组件。
4. **`RouterLink`**: 声明式导航链接。
5. **`createWebHistory` 和 `createWebHashHistory`**: 提供不同的路由历史模式。

## 二、核心组件与函数详解

### 1. 路由匹配器：`createRouterMatcher`

```javascript
export function createRouteRecordMatcher(record, parent, options) {
  const matcher = {
    record,
    parent,
    children: [],
    alias: [],
    parse: function() {
      // ...
    },
    stringify: function() {
      // ...
    },,
  };

  if (parent) {
    parent.children.push(matcher);
  }

  return matcher;
}

export function createRouterMatcher(routes, globalOptions) {
  const matchers = [];
  const matcherMap = new Map();
  globalOptions = Object.assign({ strict: false, end: true, sensitive: false }, globalOptions);

  function getRecordMatcher(name) {
    return matcherMap.get(name);
  }

  function addRoute(record, parent) {
    const options = Object.assign({}, globalOptions, record);
    const matcher = createRouteRecordMatcher(record, parent, options);

    if (record.name) {
      matcherMap.set(record.name, matcher);
    }
    matchers.push(matcher);

    if (record.children) {
      record.children.forEach(child => {
        addRoute(child, matcher);
      });
    }

    return () => {
      removeRoute(matcher);
    };
  }

  function removeRoute(matcherRef) {
    if (typeof matcherRef === 'string') {
      const matcher = matcherMap.get(matcherRef);
      if (matcher) {
        matcherMap.delete(matcherRef);
        matchers.splice(matchers.indexOf(matcher), 1);
        matcher.alias.forEach(removeRoute);
        matcher.children.forEach(removeRoute);
      }
    } else {
      const index = matchers.indexOf(matcherRef);
      if (index > -1) {
        matchers.splice(index, 1);
        if (matcherRef.record.name) matcherMap.delete(matcherRef.record.name);
        matcherRef.alias.forEach(removeRoute);
        matcherRef.children.forEach(removeRoute);
      }
    }
  }

  function resolve(location, currentLocation) {
    let matcher;
    let params = {};
    let path;
    let name;

    if ('name' in location && location.name) {
      matcher = matcherMap.get(location.name);
      if (!matcher) {
        throw new Error();
      }
      name = matcher.record.name;
      params = Object.assign({}, location.params);
      path = matcher.stringify(params);
    } else if (location.path != null) {
      path = location.path;
      matcher = matchers.find(m => m.re.test(path));
      if (matcher) {
        params = matcher.parse(path);
        name = matcher.record.name;
      }
    } else {
      matcher = currentLocation.name
        ? matcherMap.get(currentLocation.name)
        : matchers.find(m => m.re.test(currentLocation.path));
      if (!matcher) {
        throw new Error();
      }
      name = matcher.record.name;
      params = Object.assign({}, currentLocation.params, location.params);
      path = matcher.stringify(params);
    }

    const matched = [];
    let parentMatcher = matcher;
    while (parentMatcher) {
      matched.unshift(parentMatcher.record);
      parentMatcher = parentMatcher.parent;
    }

    return {
      name,
      path,
      params,
      matched,
      meta: mergeMetaFields(matched),
    };
  }

  routes.forEach(route => addRoute(route));

  function clearRoutes() {
    matchers.length = 0;
    matcherMap.clear();
  }

  return {
    addRoute,
    resolve,
    removeRoute,
    clearRoutes,
    getRoutes: () => matchers,
    getRecordMatcher,
  };
}
```

### 2. 创建路由器：`createRouter`

```javascript
const START_LOCATION_NORMALIZED = {
  path: '/',
  name: undefined,
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  matched: [],
  meta: {},
  redirectedFrom: undefined,
};

export function createRouter(options) {
  const matcher = createRouterMatcher(options.routes, options);
  const routerHistory = options.history;

  if (!routerHistory) {
    throw new Error();
  }

  const currentRoute = shallowRef(START_LOCATION_NORMALIZED);

  // Navigation guards
  const beforeGuards = useCallbacks();
  const beforeResolveGuards = useCallbacks();
  const afterGuards = useCallbacks();

  function resolve(rawLocation, currentLocation = currentRoute.value) {
    const matcherLocation = Object.assign({}, rawLocation, {
      params: rawLocation.params || {},
      query: rawLocation.query || {},
      hash: rawLocation.hash || "",
    });

    const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
    const fullPath = stringifyURL({
      path: matchedRoute.path,
      query: matcherLocation.query,
      hash: encodeHash(matcherLocation.hash),
    });
    const href = routerHistory.createHref(fullPath);

    return Object.assign(
      {
        fullPath,
        hash: matcherLocation.hash,
        query: matcherLocation.query,
      },
      matchedRoute,
      {
        redirectedFrom: undefined,
        href,
      }
    );
  }

  // Core navigation logic with guards
  async function navigate(to, from = currentRoute.value, replace = false) {
    const toLocation = resolve(to, from);
    if (toLocation === from) {
      return Promise.resolve();
    }

    // Run before guards
    for (const guard of beforeGuards.list()) {
      const result = await guard(toLocation, from);
      if (result === false) return Promise.reject(new Error("Navigation aborted by guard"));
    }

    // Update current route
    currentRoute.value = toLocation;

    // Run beforeResolve guards
    for (const guard of beforeResolveGuards.list()) {
      const result = await guard(toLocation, from);
      if (result === false) return Promise.reject(new Error("Navigation aborted by beforeResolve guard"));
    }

    // Push or replace history
    await (replace ? routerHistory.replace(toLocation.fullPath) : routerHistory.push(toLocation.fullPath));

    // Run after guards
    for (const guard of afterGuards.list()) {
      guard(toLocation, from);
    }

    return Promise.resolve();
  }

  function push(to) {
    return navigate(to, currentRoute.value, false);
  }

  function replace(to) {
    return navigate(to, currentRoute.value, true);
  }

  function setupListeners() {
    routerHistory.listen((to, from) => {
      navigate(to, from).catch(console.error);
    });
  }

  setupListeners();

  return {
    currentRoute,
    push,
    replace,
    resolve,
    beforeEach: beforeGuards.add,
    beforeResolve: beforeResolveGuards.add,
    afterEach: afterGuards.add,
    install(app) {
      const router = this;

      app.component("RouterLink", RouterLink);
      app.component("RouterView", RouterView);
      app.config.globalProperties.$router = router;
      Object.defineProperty(app.config.globalProperties, "$route", {
        enumerable: true,
        get: () => currentRoute.value,
      });

      app.provide(routerKey, router);
      app.provide(routerViewLocationKey, currentRoute);
    },
  };
}
```

**说明：**

- 使用 `shallowRef` 来创建一个浅层响应式的 `currentRoute` 变量，并通过 `provide` 方法将其注入到组件树中。
- `history` 参数决定了使用哪种历史记录模式 (`HTML5 History API` 或 `Hash 模式`)。

### 3. 视图渲染：`RouterView`

```javascript
export const RouterView = defineComponent({
  name: 'RouterView',
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: 'default',
    },
    route: Object,
  },
  setup(props, { attrs, slots }) {
    const injectedRoute = inject(routerViewLocationKey);
    const routeToDisplay = computed(() => props.route || injectedRoute.value);
    const injectedDepth = inject(viewDepthKey, 0);
    const depth = computed(() => {
      let currentDepth = injectedDepth.value;
      while (routeToDisplay.value.matched[currentDepth] && !routeToDisplay.value.matched[currentDepth].components) {
        currentDepth++;
      }
      return currentDepth;
    });
    const matchedRouteRef = computed(() => routeToDisplay.value.matched[depth.value]);

    return () => {
      const route = routeToDisplay.value;
      const matchedRoute = matchedRouteRef.value;
      const ViewComponent = matchedRoute && matchedRoute.components[props.name];

      if (!ViewComponent) {
        return normalizeSlot(slots.default, { Component: ViewComponent, route });
      }

      const routeProps = matchedRoute.props[props.name]
        ? matchedRoute.props[props.name](route)
        : null;

      return h(
        ViewComponent,
        { ...routeProps, ...attrs }
      );
    };
  },
});
```

在 `RouterView` 组件中，我们通过 `inject` 获取到 `currentRoute`，并根据其变化动态渲染相应的组件。

### 4. 导航链接：`RouterLink`

```javascript
export const RouterLink = defineComponent({
  name: 'RouterLink',
  props: {
    activeClass: String,
    exactActiveClass: String,
  },
  setup(props, { slots }) {
    const link = reactive(useLink(props));
    const { options } = inject(routerKey);

    const elClass = computed(() => ({
      [getLinkClass(props.activeClass, options.linkActiveClass, 'router-link-active')]: link.isActive,
      [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, 'router-link-exact-active')]: link.isExactActive,
    }));

    return () => {
      const children = slots.default && preferSingleVNode(slots.default(link));

      return h(
        'a',
        {
          href: link.href,
          onClick: link.navigate,
          class: elClass.value,
        },
        children
      );
    };
  },
});
```

用于创建导航链接，避免直接跳转导致页面刷新。

### 5. 历史模式：`createWebHistory` 和 `createWebHashHistory`

#### `createWebHistory`

```javascript
function createCurrentLocation(base, location) {
  const { pathname, search, hash } = location;
  return stripBase(pathname + search + hash, base);
}

function useHistoryListeners(base, historyState, currentLocation, replace) {
  let listeners = [];
  let teardowns = [];
  let pauseState = null;

  const popStateHandler = (event) => {
    const to = createCurrentLocation(base, location);
    const from = currentLocation.value;
    const fromState = historyState.value;
    let delta = 0;

    if (event.state) {
      currentLocation.value = to;
      historyState.value = event.state;
      delta = fromState ? event.state.position - fromState.position : 0;
    } else {
      replace(to);
    }

    if (pauseState && pauseState === from) {
      pauseState = null;
      return;
    }

    listeners.forEach(listener => {
      listener(currentLocation.value, from, {
        delta,
        type: 'pop',
        direction: delta > 0 ? 'forward' : delta < 0 ? 'back' : 'unknown',
      });
    });
  };

  function pauseListeners() {
    pauseState = currentLocation.value;
  }

  function listen(callback) {
    listeners.push(callback);
    const teardown = () => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
    teardowns.push(teardown);
    return teardown;
  }

  function destroy() {
    teardowns.forEach(teardown => teardown());
    window.removeEventListener('popstate', popStateHandler);
  }

  window.addEventListener('popstate', popStateHandler);

  return { pauseListeners, listen, destroy };
}

function useHistoryStateNavigation(base) {
  const { history, location } = window;

  const currentLocation = { value: createCurrentLocation(base, location) };
  const historyState = { value: history.state };

  if (!historyState.value) {
    const initialState = {
      back: null,
      current: currentLocation.value,
      forward: null,
      position: history.length - 1,
      replaced: true,
      scroll: null,
    };
    history.replaceState(initialState, '');
    historyState.value = initialState;
  }

  function changeLocation(to, state, replace) {
    const hashIndex = base.indexOf('#')
    const url =
      hashIndex > -1
        ? (location.host && document.querySelector('base')
            ? base
            : base.slice(hashIndex)) + to
        : createBaseLocation() + base + to

    try {
      history[replace ? 'replaceState' : 'pushState'](state, '', url);
      historyState.value = state;
    } catch (err) {
      warn('Error with push/replace State', err);
      location[replace ? 'replace' : 'assign'](url);
    }
  }

  function replace(to, data) {
    const state = assign({}, history.state, {
      forward: null,
      current: to,
      replaced: true,
      position: historyState.value.position,
    }, data);

    changeLocation(to, state, true);
    currentLocation.value = to;
  }

  function push(to, data) {
    const currentState = assign({}, history.state, {
      forward: to,
      scroll: computeScrollPosition(),
    });

    changeLocation(currentState.current, currentState, true);

    const state = assign({}, {
      back: currentLocation.value,
      current: to,
      forward: null,
      position: currentState.position + 1,
    }, data);

    changeLocation(to, state, false);
    currentLocation.value = to;
  }

  return { location: currentLocation, state: historyState, push, replace };
}

export function createWebHistory(base = '') {
  base = normalizeBase(base);

  const { location, state, push, replace } = useHistoryStateNavigation(base);
  const { pauseListeners, listen, destroy } = useHistoryListeners(base, state, location, replace);

  function go(delta, triggerListeners = true) {
    if (!triggerListeners) pauseListeners();
    history.go(delta);
  }

  const routerHistory = {
    location: location.value,
    base,
    go,
    createHref: createHref.bind(null, base),
    push,
    replace,
    listen,
    destroy,
  };

  return routerHistory;
}
```

#### `createWebHashHistory`

```javascript
export function createWebHashHistory(base?: string): RouterHistory {
  base = location.host ? base || location.pathname + location.search : ''
  // allow the user to provide a `#` in the middle: `/base/#/app`
  if (!base.includes('#')) base += '#'

  return createWebHistory(base)
}
```

**核心流程：**

- 解析路由配置，接收路由配置数组，解析每个路由的路径模式、名称和其他属性。
- 匹配路径，提供方法来根据当前 URL 匹配最合适的路由规则，返回匹配结果。

## 三、工作流程

1. **初始化阶段**：
   - 调用 `createRouter` 初始化路由实例。
   - 设置历史模式（`createWebHistory` 或 `createWebHashHistory`）。
   - 使用 `createRouterMatcher` 解析并存储路由规则。

2. **监听URL变化**：
   - 根据选择的历史模式设置监听器，当 URL 发生变化时触发相应的导航逻辑。

3. **导航处理**：
   - 当用户点击 `RouterLink` 或通过编程方式调用 `$router.push()` 时，会触发导航逻辑。
   - 使用路由匹配器查找匹配的路由，并更新 `currentRoute`。
   - 根据新的路由状态重新渲染 `RouterView` 中的内容。

4. **视图更新**：
   - `RouterView` 监听路由变化，动态渲染匹配到的组件。

## 四、完整示例

以下是一个完整的 Vue Router 示例，展示了如何配置和使用上述核心组件和函数：

```javascript
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from './router'; // 自定义实现
import Home from './views/Home.vue';
import About from './views/About.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

const app = createApp(App);
app.use(router);
app.mount('#app');

// App.vue
<template>
  <div id="app">
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
```

对于 `Home.vue` 和 `About.vue` 组件，可以简单定义如下：

```html
<!-- Home.vue -->
<template>
  <div>
    <h1>Home Page</h1>
  </div>
</template>

<!-- About.vue -->
<template>
  <div>
    <h1>About Page</h1>
  </div>
</template>
```

## 五、总结

通过深入了解 Vue Router 4 的核心概念和工作流程，我们可以更好地利用其功能来构建复杂的单页应用。掌握这些基础知识不仅有助于解决日常开发中的问题，也为探索更高级的功能和优化打下了坚实的基础。希望这篇指南能够帮助你更好地理解和使用 Vue Router 4。
