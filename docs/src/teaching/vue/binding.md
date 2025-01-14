# 双向绑定实现方案

## 方案1：Object.defineProperty + 发布-订阅模式

### 技术原理

* 使用 Object.defineProperty 劫持对象的属性，通过getter收集依赖，在setter触发依赖更新。
* 借助发布-订阅模式（Dep），对依赖进行统一管理。

### 优点

* 易于理解，实现简单。
* 兼容性好。

### 缺点

* 无法监听新增/删除属性。
* 无法直接监听数组的变化。

核心代码实现

``` javascript
class Dep {
  constructor() {
    this.subscribers = new Set(); // 使用Set避免重复订阅
  }

  depend() {
    if (Dep.target) {
      this.subscribers.add(Dep.target); // 收集当前依赖
    }
  }

  notify() {
    this.subscribers.forEach(sub => sub()); // 通知所有依赖更新
  }
}

function defineReactive(obj, key, value) {
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    get() {
      dep.depend(); // 收集依赖
      return value;
    },
    set(newVal) {
      if (newVal !== value) {
        value = newVal;
        dep.notify(); // 通知依赖更新
      }
    }
  });
}

function observer(obj) {
  if (!obj || typeof obj !== 'object') return;
  Object.keys(obj).forEach(key => defineReactive(obj, key, obj[key]));
}

// 测试
Dep.target = null; // 全局依赖
function autorun(update) {
  Dep.target = update;
  update(); // 触发依赖收集
  Dep.target = null;
}

const data = { name: 'Vue', age: 2 };
observer(data);

autorun(() => console.log(`Name: ${data.name}`));
data.name = 'Vue 2'; // 触发视图更新
```

## 方案2：Proxy + 发布-订阅模式

### 技术原理

* 使用 Proxy 劫持整个对象，通过get收集依赖，通过set触发更新。
* 对数组操作和新增/删除属性的监听支持更好。

### 优点

* 支持监听新增/删除属性及数组操作。
* 更适合复杂场景，如Vue 3。

### 缺点

* Proxy 需要现代浏览器支持。

核心代码实现

``` javascript
class Dep {
  constructor() {
    this.subscribers = new Set();
  }

  depend() {
    if (Dep.target) {
      this.subscribers.add(Dep.target);
    }
  }

  notify() {
    this.subscribers.forEach(sub => sub());
  }
}

function reactive(obj) {
  const depMap = new WeakMap(); // 每个属性独立的依赖管理

  function getDep(target, key) {
    if (!depMap.has(target)) depMap.set(target, new Map());
    const targetMap = depMap.get(target);
    if (!targetMap.has(key)) targetMap.set(key, new Dep());
    return targetMap.get(key);
  }

  return new Proxy(obj, {
    get(target, key) {
      const dep = getDep(target, key);
      dep.depend(); // 收集依赖
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      const dep = getDep(target, key);
      const result = Reflect.set(target, key, value);
      dep.notify(); // 通知依赖更新
      return result;
    }
  });
}

// 测试
Dep.target = null;
function autorun(update) {
  Dep.target = update;
  update();
  Dep.target = null;
}

const data = reactive({ name: 'Vue', age: 2 });
autorun(() => console.log(`Name: ${data.name}`));
data.name = 'Vue 3'; // 触发视图更新
```

## 方案3：AngularJS 的脏检查机制

### 技术原理

* 使用循环检测的方式，每隔一定时间对数据状态和视图状态进行比较，发现变化则更新视图。
* 主要依赖$digest和$apply。

### 优点

* 实现简单，适合早期环境（如AngularJS）。
* 不需要对数据进行代理或劫持。

### 缺点

* 性能较低，尤其是数据量较大时。
* 对实时性要求高的场景不友好。

核心代码实现

``` javascript
class Scope {
  constructor() {
    this.$$watchers = [];
  }

  $watch(expr, listener) {
    this.$$watchers.push({ expr, listener, last: expr() });
  }

  $digest() {
    let dirty;
    do {
      dirty = false;
      this.$$watchers.forEach(watcher => {
        const newValue = watcher.expr();
        const oldValue = watcher.last;
        if (newValue !== oldValue) {
          watcher.listener(newValue, oldValue);
          watcher.last = newValue;
          dirty = true;
        }
      });
    } while (dirty);
  }
}

// 测试
const scope = new Scope();
let name = 'Angular';

scope.$watch(() => name, (newValue, oldValue) => {
  console.log(`Name changed: ${oldValue} -> ${newValue}`);
});

name = 'AngularJS';
scope.$digest(); // 手动触发脏检查
```

## 总结对比

| 方案 | 优点 | 缺点 | 使用场景 |
| --- | ---- | ---- | ------- |
| Object.defineProperty + 发布订阅 | 简单易用，兼容性好 | 无法监听新增/删除属性，数组监听有限 | Vue 2 等传统框架 |
| Proxy + 发布订阅 | 功能强大，支持新增/删除属性及数组操作 | 需要现代浏览器支持 | Vue 3 等现代框架 |
| 脏检查 | 实现简单，适用于早期浏览器 | 性能较低，适合小型项目 | AngularJS 等早期框架 |

#### 推荐

* 对现代项目推荐使用Proxy方案，功能更强大。
* 对兼容性要求较高的项目，可选择Object.defineProperty方案。
* 对简单项目或老项目，可使用脏检查机制。
