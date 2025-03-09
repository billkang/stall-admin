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
// 创建一个路由记录匹配器
export function createRouteRecordMatcher(record, parent, options) {
  // 匹配器对象
  const matcher = {
    // 当前路由记录
    record,
    // 父级路由匹配器
    parent,
    // 子路由匹配器数组
    children: [],
    // 别名数组
    alias: [],
    // 解析路径的方法（暂未实现）
    parse: function() {
      // ...
    },
    // 将路径参数序列化为字符串的方法（暂未实现）
    stringify: function() {
      // ...
    },
  };

  // 如果有父级匹配器，则将当前匹配器添加到父级的子路由数组中
  if (parent) {
    parent.children.push(matcher);
  }

  // 返回创建的匹配器对象
  return matcher;
}

// 创建一个路由匹配器
export function createRouterMatcher(routes, globalOptions) {
  // 存储所有路由匹配器的数组
  const matchers = [];
  // 存储路由名称与匹配器映射关系的 Map
  const matcherMap = new Map();

  // 根据路由名称获取对应的路由记录匹配器
  function getRecordMatcher(name) {
    return matcherMap.get(name);
  }

  // 添加路由记录
  function addRoute(record, parent) {
    // 合并全局选项和路由记录的选项
    const options = Object.assign({}, globalOptions, record);
    // 创建路由记录匹配器
    const matcher = createRouteRecordMatcher(record, parent, options);

    // 如果路由记录有名称，则将其添加到映射表中
    if (record.name) {
      matcherMap.set(record.name, matcher);
    }
    // 将匹配器添加到匹配器数组中
    matchers.push(matcher);

    // 如果路由记录有子路由，则递归添加子路由
    if (record.children) {
      record.children.forEach(child => {
        addRoute(child, matcher);
      });
    }

    // 返回一个函数，用于移除当前路由记录
    return () => {
      removeRoute(matcher);
    };
  }

  // 移除路由记录
  function removeRoute(matcherRef) {
    // 如果通过路由名称移除
    if (typeof matcherRef === 'string') {
      const matcher = matcherMap.get(matcherRef);
      if (matcher) {
        // 从映射表中移除
        matcherMap.delete(matcherRef);
        // 从匹配器数组中移除
        matchers.splice(matchers.indexOf(matcher), 1);
        // 递归移除别名和子路由
        matcher.alias.forEach(removeRoute);
        matcher.children.forEach(removeRoute);
      }
    } else {
      // 如果通过匹配器对象移除
      const index = matchers.indexOf(matcherRef);
      if (index > -1) {
        // 从匹配器数组中移除
        matchers.splice(index, 1);
        // 如果匹配器有名称，则从映射表中移除
        if (matcherRef.record.name) matcherMap.delete(matcherRef.record.name);
        // 递归移除别名和子路由
        matcherRef.alias.forEach(removeRoute);
        matcherRef.children.forEach(removeRoute);
      }
    }
  }

  // 解析路由位置
  function resolve(location, currentLocation) {
    let matcher;
    let params = {};
    let path;
    let name;

    // 如果通过路由名称解析
    if ('name' in location && location.name) {
      // 从映射表中获取匹配器
      matcher = matcherMap.get(location.name);
      if (!matcher) {
        // 如果找不到匹配器，抛出错误
        throw new Error();
      }
      // 设置路由名称
      name = matcher.record.name;
      // 合并传入的参数
      params = Object.assign({}, location.params);
      // 将参数序列化为路径
      path = matcher.stringify(params);
    }
    // 如果通过路径解析
    else if (location.path != null) {
      // 设置路径
      path = location.path;
      // 在匹配器数组中查找匹配的路由
      matcher = matchers.find(m => m.re.test(path));
      if (matcher) {
        // 解析路径中的参数
        params = matcher.parse(path);
        // 设置路由名称
        name = matcher.record.name;
      }
    }
    // 如果没有提供路径或名称，则使用当前路由位置解析
    else {
      // 获取当前路由的匹配器
      matcher = currentLocation.name
        ? matcherMap.get(currentLocation.name)
        : matchers.find(m => m.re.test(currentLocation.path));
      if (!matcher) {
        // 如果找不到匹配器，抛出错误
        throw new Error();
      }
      // 设置路由名称
      name = matcher.record.name;
      // 合并当前路由参数和传入的参数
      params = Object.assign({}, currentLocation.params, location.params);
      // 将参数序列化为路径
      path = matcher.stringify(params);
    }

    // 构建匹配的路由记录数组
    const matched = [];
    let parentMatcher = matcher;
    while (parentMatcher) {
      matched.unshift(parentMatcher.record);
      parentMatcher = parentMatcher.parent;
    }

    // 返回解析结果
    return {
      name,
      path,
      params,
      matched,
      meta: {}, // 路由元信息（暂未实现）
    };
  }

  // 添加所有初始路由记录
  routes.forEach(route => addRoute(route));

  // 清空所有路由记录
  function clearRoutes() {
    matchers.length = 0;
    matcherMap.clear();
  }

  // 返回路由匹配器的接口
  return {
    addRoute, // 添加路由记录
    resolve, // 解析路由位置
    removeRoute, // 移除路由记录
    clearRoutes, // 清空所有路由记录
    getRoutes: () => matchers, // 获取所有路由匹配器
    getRecordMatcher, // 根据路由名称获取路由记录匹配器
  };
}
```

#### 注释说明

1. createRouteRecordMatcher：
   * 创建一个路由记录匹配器对象，包含路由记录、父级匹配器、子路由匹配器数组等属性。
   * 如果有父级匹配器，将当前匹配器添加到父级的子路由数组中。
2. createRouterMatcher：
   * 创建一个路由匹配器，包含路由匹配器数组、路由名称与匹配器的映射表等。
   * 提供了添加、移除、解析路由记录的方法。
3. addRoute：
   * 添加路由记录到匹配器中，支持递归添加子路由。
   * 如果路由有名称，将其添加到映射表中。
4. removeRoute：
   * 移除路由记录，支持通过名称或匹配器对象移除。
   * 递归移除别名和子路由。
5. resolve：
   * 解析路由位置，支持通过名称、路径或当前路由位置解析。
   * 构建匹配的路由记录数组，返回解析结果。
6. clearRoutes：
   * 清空所有路由记录。
7. 返回的接口：
   * 提供了操作路由匹配器的方法，如添加、移除、解析路由记录等。

### 2. 创建路由器：`createRouter`

```javascript
// 定义初始路由位置的默认值
const START_LOCATION_NORMALIZED = {
  path: '/',
  name: undefined,
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  matched: [],
  meta: {},
};

// 创建一个路由器实例
export function createRouter(options) {
  // 创建路由匹配器，用于解析和管理路由规则
  const matcher = createRouterMatcher(options.routes, options);
  // 获取路由历史管理器（如 browser history 或 hash history）
  const routerHistory = options.history;

  // 如果没有提供路由历史管理器，则抛出错误
  if (!routerHistory) {
    throw new Error('Router history is required');
  }

  // 当前路由状态，初始值为默认的初始路由位置
  const currentRoute = shallowRef(START_LOCATION_NORMALIZED);

  // 定义导航守卫的回调管理器
  const beforeGuards = useCallbacks(); // 全局前置守卫
  const beforeResolveGuards = useCallbacks(); // 全局解析守卫
  const afterGuards = useCallbacks(); // 全局后置守卫

  // 解析目标路由位置
  function resolve(rawLocation, currentLocation = currentRoute.value) {
    // 将传入的原始位置对象标准化
    const matcherLocation = Object.assign({}, rawLocation, {
      params: rawLocation.params || {},
      query: rawLocation.query || {},
      hash: rawLocation.hash || "",
    });

    // 使用路由匹配器解析目标路由
    const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
    // 将解析后的路径、查询参数和哈希值序列化为完整的 URL
    const fullPath = stringifyURL({
      path: matchedRoute.path,
      query: matcherLocation.query,
      hash: encodeHash(matcherLocation.hash),
    });

    // 返回完整的路由对象
    return Object.assign(
      {
        fullPath,
        hash: matcherLocation.hash,
        query: matcherLocation.query,
      },
      matchedRoute,
    );
  }

  // 核心导航逻辑，包含导航守卫的执行
  async function navigate(to, from = currentRoute.value, replace = false) {
    // 解析目标路由位置
    const toLocation = resolve(to, from);
    // 如果目标路由与当前路由相同，则直接返回
    if (toLocation === from) {
      return Promise.resolve();
    }

    // 执行全局前置守卫
    for (const guard of beforeGuards.list()) {
      const result = await guard(toLocation, from);
      // 如果守卫返回 false，则中断导航
      if (result === false) return Promise.reject(new Error("Navigation aborted by guard"));
    }

    // 更新当前路由状态
    currentRoute.value = toLocation;

    // 执行全局解析守卫
    for (const guard of beforeResolveGuards.list()) {
      const result = await guard(toLocation, from);
      // 如果解析守卫返回 false，则中断导航
      if (result === false) return Promise.reject(new Error("Navigation aborted by beforeResolve guard"));
    }

    // 根据 replace 参数决定是替换历史记录还是添加新记录
    await (replace ? routerHistory.replace(toLocation.fullPath) : routerHistory.push(toLocation.fullPath));

    // 执行全局后置守卫
    for (const guard of afterGuards.list()) {
      guard(toLocation, from);
    }

    // 导航完成，返回 Promise
    return Promise.resolve();
  }

  // 提供 push 方法用于导航到新路由
  function push(to) {
    return navigate(to, currentRoute.value, false);
  }

  // 提供 replace 方法用于替换当前路由
  function replace(to) {
    return navigate(to, currentRoute.value, true);
  }

  // 设置路由历史监听器
  function setupListeners() {
    // 当路由历史发生变化时，触发导航逻辑
    routerHistory.listen((to, from) => {
      navigate(to, from).catch(console.error);
    });
  }

  // 初始化路由监听器
  setupListeners();

  // 返回路由器实例的接口
  return {
    currentRoute, // 当前路由状态
    push, // 导航到新路由
    replace, // 替换当前路由
    resolve, // 解析目标路由位置
    beforeEach: beforeGuards.add, // 添加全局前置守卫
    beforeResolve: beforeResolveGuards.add, // 添加全局解析守卫
    afterEach: afterGuards.add, // 添加全局后置守卫
    install(app) { // 安装路由器到 Vue 应用
      const router = this;

      // 注册 RouterLink 和 RouterView 组件
      app.component("RouterLink", RouterLink);
      app.component("RouterView", RouterView);
      // 将路由器实例挂载到全局属性
      app.config.globalProperties.$router = router;
      // 定义 $route 全局属性，指向当前路由状态
      Object.defineProperty(app.config.globalProperties, "$route", {
        enumerable: true,
        get: () => currentRoute.value,
      });

      // 提供路由器实例和当前路由状态
      app.provide(routerKey, router);
      app.provide(routerViewLocationKey, currentRoute);
    },
  };
}
```

#### 注释说明

1. START_LOCATION_NORMALIZED：
   * 定义初始路由位置的默认值，表示应用启动时的初始路由状态。
2. createRouter：
   * 创建一个路由器实例，包含路由匹配器、路由历史管理器、当前路由状态等核心功能。
3. resolve：
   * 解析目标路由位置，将传入的原始位置对象标准化，并通过路由匹配器解析目标路由。
4. navigate：
   * 核心导航逻辑，包含全局前置守卫、解析守卫和后置守卫的执行。
   * 根据 replace 参数决定是替换历史记录还是添加新记录。
5. push 和 replace：
   * 提供导航到新路由或替换当前路由的方法。
6. setupListeners：
   * 设置路由历史监听器，当路由历史发生变化时，触发导航逻辑。
7. install：
   * 安装路由器到 Vue 应用，注册 RouterLink 和 RouterView 组件，提供全局 $router 和 $route 属性。

#### 关键点

1. 导航守卫：
   * 全局前置守卫（beforeEach）：在导航开始前执行。
   * 全局解析守卫（beforeResolve）：在导航确认后、DOM 更新前执行。
   * 全局后置守卫（afterEach）：在导航完成后执行。
2. 路由历史管理：
   * `history` 参数决定了使用哪种历史记录模式 (`HTML5 History API` 或 `Hash 模式`)。
   * 使用 routerHistory 管理浏览器历史记录，支持 push 和 replace 操作。
3. 路由解析：
   * 使用 resolve 方法将目标路由位置解析为完整的路由对象。
4. 全局变量
   * 使用 `shallowRef` 来创建一个浅层响应式的 `currentRoute` 变量，并通过 `provide` 方法将其注入到组件树中。

### 3. 视图渲染：`RouterView`

```javascript
export const RouterView = defineComponent({
  // 组件名称
  name: 'RouterView',
  // 不继承父组件的属性
  inheritAttrs: false,
  // 定义组件的属性
  props: {
    // 路由名称，默认值为 'default'
    name: {
      type: String,
      default: 'default',
    },
    // 自定义路由对象（可选）
    route: Object,
  },
  // 组件的 setup 函数
  setup(props, { attrs, slots }) {
    // 从上下文中注入当前路由位置（通过 routerViewLocationKey 提供）
    const injectedRoute = inject(routerViewLocationKey);
    // 计算当前需要显示的路由对象
    // 如果传入了自定义 route，则使用自定义 route，否则使用注入的路由
    const routeToDisplay = computed(() => props.route || injectedRoute.value);

    // 从上下文中注入当前视图深度（通过 viewDepthKey 提供，默认值为 0）
    const injectedDepth = inject(viewDepthKey, 0);
    // 计算当前视图的深度
    const depth = computed(() => {
      // 从当前注入的深度开始
      let currentDepth = injectedDepth.value;
      // 遍历匹配的路由记录，直到找到包含组件定义的路由记录
      while (
        routeToDisplay.value.matched[currentDepth] &&
        !routeToDisplay.value.matched[currentDepth].components
      ) {
        currentDepth++;
      }
      return currentDepth;
    });

    // 获取当前深度对应的匹配路由记录
    const matchedRouteRef = computed(() => routeToDisplay.value.matched[depth.value]);

    // 返回组件的渲染函数
    return () => {
      // 当前路由对象
      const route = routeToDisplay.value;
      // 当前深度对应的匹配路由记录
      const matchedRoute = matchedRouteRef.value;
      // 获取当前路由名称对应的组件
      const ViewComponent = matchedRoute && matchedRoute.components[props.name];

      // 如果匹配的路由记录中定义了 props，则计算 props
      const routeProps = matchedRoute.props[props.name]
        ? matchedRoute.props[props.name](route)
        : null;

      // 渲染组件
      // 使用 h 函数创建 VNode，将 routeProps 和 attrs 合并为组件的属性
      return h(
        ViewComponent,
        { ...routeProps, ...attrs }
      );
    };
  },
});
```

#### 注释说明

1. 组件定义：
   * 使用 defineComponent 定义 RouterView 组件。
   * name：组件名称。
   * inheritAttrs：设置为 false，表示不继承父组件的属性。
2. 属性（Props）：
   * name：路由名称，默认值为 'default'。
   * route：可选的自定义路由对象，用于覆盖注入的路由。
3. setup 函数：
   * props：组件的属性。
   * { attrs, slots }：从上下文中获取组件的其他属性和插槽。
4. 注入路由信息：
   * injectedRoute：从上下文中注入当前路由位置（通过 routerViewLocationKey 提供）。
   * routeToDisplay：计算当前需要显示的路由对象。如果传入了自定义 route，则优先使用自定义路由，否则使用注入的路由。
5. 视图深度计算：
   * injectedDepth：从上下文中注入当前视图深度（通过 viewDepthKey 提供，默认值为 0）。
   * depth：计算当前视图的深度。从注入的深度开始，遍历匹配的路由记录，直到找到包含组件定义的路由记录。
6. 匹配路由记录：
   * matchedRouteRef：获取当前深度对应的匹配路由记录。
7. 渲染逻辑：
   * 获取当前路由名称对应的组件（ViewComponent）。
   * 如果匹配的路由记录中定义了 props，则计算动态 props。
   * 使用 h 函数创建 VNode，将 routeProps 和 attrs 合并为组件的属性，渲染目标组件。

#### 关键点

1. 动态组件渲染：
   * RouterView 根据当前路由匹配的组件动态渲染内容。
   * 在 `RouterView` 组件中，我们通过 `inject` 获取到 `currentRoute`，并根据其变化动态渲染相应的组件。
2. 路由深度管理：
   * 通过计算视图深度，支持嵌套路由的正确渲染。
3. 属性传递：
   * 将路由定义的 props 和父组件传递的 attrs 合并传递给目标组件。
4. 依赖注入：
   * 使用 Vue 的依赖注入机制（inject）获取当前路由位置和视图深度。

#### 使用场景

* RouterView 是 Vue Router 中的核心组件，用于渲染当前路由匹配的组件。
* 支持嵌套路由和命名视图。
* 可以通过 props 传递自定义路由对象，用于测试或高级用法。

### 4. 导航链接：`RouterLink`

```javascript
export const RouterLink = defineComponent({
  // 组件名称
  name: 'RouterLink',

  // 定义组件的属性（props）
  props: {
    // 自定义激活状态的 CSS 类名
    activeClass: String,
    // 自定义精确激活状态的 CSS 类名
    exactActiveClass: String,
  },

  // 组件的 setup 函数
  setup(props, { slots }) {
    // 使用 useLink 函数创建一个响应式的链接对象
    const link = reactive(useLink(props));

    // 从路由器实例中注入配置选项
    const { options: { linkActiveClass, linkExactActiveClass } } = inject(routerKey);

    // 获取组件属性中的自定义类名
    const { activeClass, exactActiveClass } = props;

    // 计算元素的类名
    const elClass = computed(() => ({
      // 动态生成激活状态的类名
      [getLinkClass(activeClass, linkActiveClass, 'router-link-active')]: link.isActive,
      // 动态生成精确激活状态的类名
      [getLinkClass(exactActiveClass, linkExactActiveClass, 'router-link-exact-active')]: link.isExactActive,
    }));

    // 返回组件的渲染函数
    return () => {
      // 获取默认插槽的内容，并确保只渲染一个 VNode
      const children = slots.default && preferSingleVNode(slots.default(link));

      // 使用 h 函数渲染 <a> 标签
      return h(
        'a', // 渲染为 <a> 标签
        {
          href: link.href, // 设置链接的 href 属性
          onClick: link.navigate, // 绑定点击事件，用于导航
          class: elClass.value, // 动态绑定类名
        },
        children // 插槽内容
      );
    };
  },
});
```

#### 注释说明

1. 组件定义：
   * 使用 defineComponent 定义 RouterLink 组件。
   * name：组件名称为 'RouterLink'。
2. 属性（Props）：
   * activeClass：自定义激活状态的 CSS 类名。
   * exactActiveClass：自定义精确激活状态的 CSS 类名。
   * 这些属性允许用户自定义链接的激活状态样式。
3. setup 函数：
   * props：组件的属性。
   * { slots }：从上下文中获取默认插槽的内容。
4. 链接对象：
   * 使用 useLink 函数创建一个响应式的链接对象 link。
   * link 对象包含以下属性：
     * href：链接的 URL。
     * isActive：是否处于激活状态。
     * isExactActive：是否处于精确激活状态。
     * navigate：点击链接时触发的导航函数。
5. 注入路由器配置：
   * 使用 inject 从路由器实例中获取配置选项：
     * linkActiveClass：默认激活状态的类名。
     * linkExactActiveClass：默认精确激活状态的类名。
6. 动态类名计算：
   * 使用 computed 计算元素的类名：
     * 如果链接处于激活状态，添加自定义的 activeClass 或默认的 linkActiveClass。
     * 如果链接处于精确激活状态，添加自定义的 exactActiveClass 或默认的 linkExactActiveClass。
   * getLinkClass 是一个辅助函数，用于优先选择用户自定义的类名，如果没有则使用默认值。
7. 渲染逻辑：
   * 使用 h 函数渲染 a 标签。
   * 设置 href 属性为链接的 URL。
   * 绑定 onClick 事件，触发导航逻辑。
   * 动态绑定类名，根据链接的激活状态添加相应的 CSS 类。
   * 渲染默认插槽的内容，允许用户自定义链接的显示内容。

#### 关键点

1. 响应式链接对象：
   * 使用 useLink 创建响应式的链接对象，包含链接的 URL、激活状态和导航函数。
2. 动态类名：
   * 根据链接的激活状态动态绑定 CSS 类名，支持自定义类名和默认类名。
3. 插槽支持：
   * 使用默认插槽允许用户自定义链接的显示内容。
4. 导航功能：
   * 点击链接时触发 link.navigate，实现路由导航。

#### 使用场景

* RouterLink 是 Vue Router 中的核心组件，用于创建导航链接。
* 默认渲染为 a 标签，支持自定义激活状态的样式。
* 支持嵌套插槽内容，允许用户自定义链接的显示。

### 5. 历史模式：`createWebHistory` 和 `createWebHashHistory`

#### `createWebHistory`

##### 5.1 createCurrentLocation 函数

```javascript
function createCurrentLocation(base, location) {
    // 从 location 对象中提取 pathname、search 和 hash
    const { pathname, search, hash } = location;
    // 拼接完整的 URL 路径，并通过 stripBase 函数移除基础路径 base
    return stripBase(pathname + search + hash, base);
}
```

###### 功能

* 根据浏览器的当前 location 对象和基础路径 base，生成当前路由的完整路径。

###### 参数

* base：基础路径，如 /app/。
* location：浏览器的 location 对象。

###### 返回值

* 当前路由的完整路径，已移除基础路径部分。

###### 用途

* 用于生成当前路由的标准化路径，以便与路由配置进行匹配。

##### 5.2 useHistoryListeners 函数

```javascript
function useHistoryListeners(base, historyState, currentLocation, replace) {
    let listeners = [];       // 存储注册的监听器回调
    let teardowns = [];       // 存储监听器的销毁函数
    let pauseState = null;    // 用于暂停监听器的状态

    // 处理浏览器的 popstate 事件
    const popStateHandler = (event) => {
        // 根据当前 location 和 base 生成目标路径
        const to = createCurrentLocation(base, location);
        const from = currentLocation.value;       // 当前路由状态
        const fromState = historyState.value;     // 当前历史状态

        let delta = 0; // 导航的步数差值

        if (event.state) {
            // 如果事件携带状态信息，更新当前路由和历史状态
            currentLocation.value = to;
            historyState.value = event.state;
            delta = fromState ? event.state.position - fromState.position : 0;
        } else {
            // 如果事件没有状态信息，调用 replace 方法更新
            replace(to);
        }

        // 如果处于暂停状态且当前状态与暂停状态一致，则忽略此次事件
        if (pauseState && pauseState === from) {
            pauseState = null;
            return;
        }

        // 通知所有监听器，路由发生了变化
        listeners.forEach(listener => {
            listener(currentLocation.value, from, {
                delta, // 导航步数差值
                type: 'pop', // 事件类型为 pop（用户触发的后退/前进）
                direction: delta > 0 ? 'forward' : delta < 0 ? 'back' : 'unknown', // 导航方向
            });
        });
    };

    // 暂停监听器，避免触发不必要的回调
    function pauseListeners() {
        pauseState = currentLocation.value;
    }

    // 注册监听器
    function listen(callback) {
        listeners.push(callback); // 将回调函数添加到监听器列表
        const teardown = () => {
            const index = listeners.indexOf(callback);
            if (index > -1) listeners.splice(index, 1); // 移除监听器
        };
        teardowns.push(teardown); // 存储销毁函数
        return teardown; // 返回销毁函数，供外部调用
    }

    // 销毁所有监听器和事件绑定
    function destroy() {
        teardowns.forEach(teardown => teardown()); // 执行所有销毁函数
        window.removeEventListener('popstate', popStateHandler); // 移除 popstate 事件监听
    }

    // 监听浏览器的 popstate 事件
    window.addEventListener('popstate', popStateHandler);

    // 返回监听器管理接口
    return { pauseListeners, listen, destroy };
}
```

###### 功能

管理浏览器的 popstate 事件，用于监听用户的后退/前进操作，并通知注册的监听器。

###### 关键点

1. pStateHandler：
   * 处理浏览器的 popstate 事件，更新当前路由状态和历史状态。
   * 算导航方向（forward 或 back），并通知所有注册的监听器。
2. useListeners：
   * 暂停监听器，避免在某些情况下触发不必要的回调。
3. sten：
   * 注册监听器，监听路由变化事件。
   * 返回一个销毁函数，用于移除监听器。
4. stroy：
   * 清理所有监听器和事件绑定，避免内存泄漏。

##### 5.3 useHistoryStateNavigation 函数

```javascript
function useHistoryStateNavigation(base) {
    const { history, location } = window; // 获取浏览器的 history 和 location 对象

    // 当前路由状态
    const currentLocation = { value: createCurrentLocation(base, location) };
    // 当前历史状态
    const historyState = { value: history.state };

    // 如果历史状态为空，初始化一个默认状态
    if (!historyState.value) {
        const initialState = {
            back: null, // 上一个路由
            current: currentLocation.value, // 当前路由
            forward: null, // 下一个路由
            position: history.length - 1, // 当前历史位置
            replaced: true, // 是否为替换操作
            scroll: null, // 滚动位置
        };
        history.replaceState(initialState, ''); // 使用 replaceState 初始化状态
        historyState.value = initialState;
    }

    // 更新浏览器历史记录
    function changeLocation(to, state, replace) {
        const hashIndex = base.indexOf('#'); // 检查基础路径是否包含 hash
        const url =
            hashIndex > -1
                ? (location.host && document.querySelector('base')
                    ? base
                    : base.slice(hashIndex)) + to // 如果包含 hash，调整 URL
                : createBaseLocation() + base + to; // 如果不包含 hash，直接拼接路径

        try {
            // 尝试使用 pushState 或 replaceState 更新历史记录
            history[replace ? 'replaceState' : 'pushState'](state, '', url);
            historyState.value = state; // 更新当前历史状态
        } catch (err) {
            // 如果失败，使用 location.assign 或 location.replace 作为回退
            warn('Error with push/replace State', err);
            location[replace ? 'replace' : 'assign'](url);
        }
    }

    // 替换当前历史记录
    function replace(to, data) {
        const state = assign({}, history.state, {
            forward: null, // 清空下一个路由
            current: to, // 更新当前路由
            replaced: true, // 标记为替换操作
            position: historyState.value.position, // 保持当前位置
        }, data);

        changeLocation(to, state, true); // 调用 changeLocation 更新历史记录
        currentLocation.value = to; // 更新当前路由状态
    }

    // 添加新的历史记录
    function push(to, data) {
        const currentState = assign({}, history.state, {
            forward: to, // 设置下一个路由
            scroll: computeScrollPosition(), // 记录当前滚动位置
        });

        changeLocation(currentState.current, currentState, true); // 更新当前状态

        const state = assign({}, {
            back: currentLocation.value, // 设置上一个路由
            current: to, // 更新当前路由
            forward: null, // 清空下一个路由
            position: currentState.position + 1, // 更新历史位置
        }, data);

        changeLocation(to, state, false); // 添加新的历史记录
        currentLocation.value = to; // 更新当前路由状态
    }

    // 返回导航接口
    return { location: currentLocation, state: historyState, push, replace };
}
```

###### 功能

* 管理浏览器的历史记录，支持 pushState 和 replaceState 操作。

###### 关键点

1. 初始化历史状态：
   * 如果浏览器的历史状态为空，则初始化一个默认状态。
2. changeLocation：
   * 更新浏览器的历史记录，支持替换当前记录或添加新记录。
3. replace 和 push：
   * replace：替换当前历史记录。
   * push：添加新的历史记录。
   * 更新当前路由状态和历史状态。

##### 5.4 createWebHistory 函数

```javascript
export function createWebHistory(base = '') {
    base = normalizeBase(base); // 规范化基础路径

    // 获取导航和历史状态管理接口
    const { location, state, push, replace } = useHistoryStateNavigation(base);
    const { pauseListeners, listen, destroy } = useHistoryListeners(base, state, location, replace);

    // 控制浏览器历史前进/后退
    function go(delta, triggerListeners = true) {
        if (!triggerListeners) pauseListeners(); // 如果需要，暂停监听器
        history.go(delta); // 调用浏览器的 history.go 方法
    }

    // 返回路由历史管理器接口
    const routerHistory = {
        location: location.value, // 当前路由位置
        base, // 基础路径
        go, // 前进/后退方法
        push, // 添加新历史记录
        replace, // 替换当前历史记录
        listen, // 注册监听器
        destroy, // 销毁监听器
    };

    return routerHistory;
}
```

###### 功能

创建一个基于 HTML5 历史模式的路由历史管理器，支持导航和监听功能。

###### 参数

base：基础路径，默认为空字符串。

###### 返回值

一个包含导航和监听功能的路由历史管理器对象。

###### 关键点

1. go 方法：
   * 调用浏览器的 history.go 方法，支持后退或前进指定的步数。
   * 可选择是否触发监听器回调。
2. 返回的路由历史管理器对象：
   * 提供 location：当前路由位置。
   * 提供 base：基础路径。
   * 提供 go、push、replace：导航方法。
   * 提供 listen 和 destroy：监听和销毁监听器。

##### 总结

这段代码实现了一个完整的基于 HTML5 历史模式的路由历史管理器，支持以下功能：

1. 导航功能：通过 push 和 replace 方法管理浏览器的历史记录。
2. 监听功能：通过 listen 方法注册监听器，监听用户的后退/前进操作。
3. 状态管理：通过 history.state 管理路由状态，支持导航方向的判断。

#### `createWebHashHistory`

```javascript
export function createWebHashHistory(base?: string): RouterHistory {
  // 如果当前页面有 host（即在浏览器环境中），则根据 URL 的 pathname 和 search 动态生成 base
  // 如果没有 host（如在测试环境中），则 base 默认为空字符串
  base = location.host ? base || location.pathname + location.search : '';

  // 如果 base 中不包含 '#'，则在 base 的末尾添加 '#'
  // 这样可以确保即使用户提供的 base 不包含 '#'，也能正确地切换到 Hash 模式
  if (!base.includes('#')) base += '#';

  // 调用 createWebHistory 函数，将 base 传递给它
  // createWebHistory 函数会处理实际的路由逻辑，而 createWebHashHistory 只是负责调整 base 的格式
  return createWebHistory(base);
}
```

##### 功能和逻辑解释

1. 动态生成 base：
   * 如果当前环境是浏览器（location.host 存在），base 的默认值会根据当前页面的 pathname 和 search 动态生成。
   * 如果没有 location.host（例如在测试环境中），base 默认为空字符串。
2. 确保 base 包含 #：
   * 如果用户提供的 base 中没有包含 #，代码会自动在 base 的末尾添加 #。
   * 这样可以确保即使用户没有显式指定 #，也能正确地切换到 Hash 模式。
3. 调用 createWebHistory：
   * createWebHashHistory 实际上是基于 createWebHistory 的封装。
   * 它通过调整 base 的格式，使 createWebHistory 能够正确处理 Hash 模式下的路由逻辑。

##### 代码的关键点

1. Hash 模式的原理：
   * Hash 模式利用 URL 的哈希部分（#）来管理路由状态。
   * 哈希部分的变化不会触发浏览器的页面刷新，因此非常适合单页面应用（SPA）。
2. 动态生成 base 的原因：
   * 在某些场景下，用户可能没有显式提供 base，或者希望 base 动态适应当前页面的路径。
   * 动态生成 base 可以提高路由系统的灵活性和易用性。
3. 兼容性：
   * Hash 模式是最早被广泛支持的前端路由技术之一，适用于不支持 HTML5 History API 的浏览器（如 IE9 及以下）。
   * 它可以避免服务器端路由冲突，因为哈希部分不会被发送到服务器。

##### 使用场景

1. 不支持 HTML5 History API 的浏览器：
   * 如果目标浏览器不支持 HTML5 History API，Hash 模式是一个很好的替代方案。
2. 避免服务器端路由冲突：
   * 在某些情况下，服务器端可能没有配置正确的路由规则，使用 Hash 模式可以避免这种问题。
3. 简单的单页面应用：
   * 对于不需要复杂路由功能的单页面应用，Hash 模式可以快速实现路由功能。

##### 完整的 Hash 模式路由逻辑

虽然 createWebHashHistory 本身相对简单，但它依赖于 createWebHistory 来实现完整的路由逻辑。createWebHistory 会处理以下内容：

* 导航功能：通过 push 和 replace 方法管理浏览器的历史记录。
* 监听功能：通过 listen 方法注册监听器，监听用户的后退/前进操作。
* 状态管理：通过 history.state 管理路由状态，支持导航方向的判断。
createWebHashHistory 的核心作用是确保 base 的格式正确，并将实际的路由逻辑委托给 createWebHistory。

## 三、工作流程

1. **初始化阶段**：
   * 调用 `createRouter` 初始化路由实例。
   * 设置历史模式（`createWebHistory` 或 `createWebHashHistory`）。
   * 使用 `createRouterMatcher` 解析并存储路由规则。

2. **监听URL变化**：
   * 根据选择的历史模式设置监听器，当 URL 发生变化时触发相应的导航逻辑。

3. **导航处理**：
   * 当用户点击 `RouterLink` 或通过编程方式调用 `$router.push()` 时，会触发导航逻辑。
   * 使用路由匹配器查找匹配的路由，并更新 `currentRoute`。
   * 根据新的路由状态重新渲染 `RouterView` 中的内容。

4. **视图更新**：
   * `RouterView` 监听路由变化，动态渲染匹配到的组件。

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

## 六、参考

[Vue3相关源码-Vue Router源码解析(一)](https://juejin.cn/post/7215967109184503864)

[Vue3相关源码-Vue Router源码解析(二)](https://juejin.cn/post/7215967453931077692)
