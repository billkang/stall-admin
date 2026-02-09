# JavaScript异步编程详解

## 同步 vs 异步

### 同步代码

按顺序执行，前一个任务必须完成后，下一个任务才能开始，这会导致阻塞后续代码的执行，直到当前任务完成。

```javascript
console.log('Start');
const result = calculateSync(); // 假设这是一个耗时操作，程序将在这里卡住，直到计算完成
console.log('Result:', result);
console.log('End');
// 输出顺序：Start → Result → End
```

### 异步代码

非阻塞执行，任务不会等待前一个任务的完成，而是继续执行后续代码，当异步任务完成后，会通过回调或 Promise 等机制通知结果。

```javascript
console.log('Start');
setTimeout(() => console.log('Timeout完成'), 1000); // 异步操作，1秒后执行回调
console.log('End');
// 输出顺序：Start → End → Timeout完成
```

## 回调函数（Callbacks）

### 基本用法

将函数作为参数传递给另一个函数，当异步操作完成后，这个回调函数会被调用。

```javascript
function fetchData(callback) {
  setTimeout(() => {
    callback('数据加载完成'); // 数据加载完成后调用回调函数
  }, 1000);
}

fetchData((data) => console.log(data)); // 1秒后输出
```

### 回调地狱（Callback Hell）

当异步操作嵌套多层时，回调函数会层层嵌套，代码难以阅读和维护，也容易出错。

```javascript
getUser(userId, (user) => {
  // 获取用户数据
  getPosts(user.id, (posts) => {
    // 获取用户帖子
    getComments(posts[0].id, (comments) => {
      // 获取帖子评论
      console.log(comments);
    });
  });
});
```

## Promise

### 基本概念

Promise 是一个对象，表示异步操作的最终完成或失败。三种状态：

- pending ：初始状态，异步操作未完成。
- fulfilled ：异步操作成功完成。
- rejected ：异步操作失败。

### 基本用法

创建 Promise 对象，并通过 `.then` 方法处理成功的情况，通过 `.catch` 方法处理失败的情况。

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    success ? resolve('成功!') : reject('失败!'); // 根据条件决定是否成功
  }, 1000);
});

promise
  .then((result) => console.log(result)) // 处理成功的情况
  .catch((error) => console.error(error)); // 处理失败的情况
```

### Promise 链式调用

多个 `.then` 方法可以链式调用，前一个 Promise 的返回值会作为后一个 `.then` 的输入。

```javascript
fetch(url)
  .then((response) => response.json()) // 将响应数据解析为 JSON
  .then((data) => processData(data)) // 处理解析后的数据
  .then((result) => console.log(result)) // 输出处理结果
  .catch((error) => console.error('链中任何错误:', error)); // 捕获整个链中的错误
```

### Promise 静态方法

- `Promise.all` ：接受一个 Promise 对象的数组，当所有 Promise 都成功时，才会返回一个新的 Promise，并将其结果作为数组。

```javascript
Promise.all([promise1, promise2, promise3])
  .then((results) => console.log(results))
  .catch((error) => console.error(error));
```

- `Promise.race` ：接受一个 Promise 对象的数组，返回一个新的 Promise，其结果取决于数组中最快完成的 Promise。

```javascript
Promise.race([promise1, promise2]).then((result) =>
  console.log('第一个完成的结果:', result),
);
```

## Async/Await

### 基于 Promise 的语法糖

用同步写法处理异步操作，使代码更直观易读。

```javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data'); // 等待请求完成
    const data = await response.json(); // 等待解析完成
    console.log(data);
  } catch (error) {
    console.error('捕获错误:', error);
  }
}
fetchData();
```

### 并行执行

使用 `Promise.all` 联合 `async/await` 可以实现多个异步任务的并行执行。

```javascript
async function parallelTasks() {
  const [data1, data2] = await Promise.all([task1(), task2()]); // 并行执行 task1 和 task2
  console.log(data1, data2);
}
```

## 事件循环（Event Loop）

### 执行机制

- **调用栈（Call Stack）** ：执行同步代码，当调用栈为空时，事件循环会开始处理任务队列中的任务。
- **任务队列（Task Queue）** ：存放宏任务（如 `setTimeout`）。
- **微任务队列（Microtask Queue）** ：存放微任务（如 `Promise.then`）。

### 事件循环流程

- 执行同步代码。
- 检查微任务队列，执行所有微任务。
- 更新页面渲染（浏览器环境）。
- 取出任务队列中的下一个宏任务，将其推入调用栈执行。
- 重复上述步骤。

### 执行顺序示例

```javascript
console.log('Start');
setTimeout(() => console.log('Timeout'), 0); // 宏任务，进入任务队列
Promise.resolve()
  .then(() => console.log('Promise 1')) // 微任务，进入微任务队列
  .then(() => console.log('Promise 2')); // 微任务，进入微任务队列
console.log('End');
// 输出顺序: Start → End → Promise 1 → Promise 2 → Timeout
```

## 其他异步操作

### 定时器

`setTimeout` 和 `setInterval` 是常见的异步定时器。

```javascript
setTimeout(() => console.log('延时1秒'), 1000); // 1秒后执行回调
setInterval(() => console.log('每秒执行'), 1000); // 每秒执行一次回调
```

### 事件监听器

通过 `addEventListener` 可以为 HTML 元素添加事件监听器，处理用户交互等事件。

```javascript
button.addEventListener('click', () => {
  // 监听按钮点击事件
  console.log('按钮被点击');
});
```

## 错误处理

### 回调中的错误处理

在回调函数中直接处理错误，通常是通过 `err` 参数。

```javascript
fs.readFile('file.txt', (err, data) => {
  if (err) return console.error(err); // 检查错误
  console.log(data); // 处理文件内容
});
```

### Promise 错误处理

使用 `.catch` 方法捕获 Promise 链中的错误，`finally` 方法用于清理操作。

```javascript
fetchData()
  .then((data) => console.log(data)) // 处理成功结果
  .catch((err) => console.error('捕获错误:', err)) // 处理错误
  .finally(() => console.log('清理操作')); // 执行清理操作
```

### Async/Await 错误处理

使用 `try/catch` 捕获异步操作中的错误。

```javascript
async function loadData() {
  try {
    const data = await fetchData(); // 等待异步操作完成
  } catch (err) {
    console.error(err); // 处理错误
  }
}
```

## 最佳实践

- 避免回调地狱 ：使用 Promise 或 Async/Await 替代多层嵌套回调。
- 始终处理错误 ：为异步操作添加错误处理逻辑，防止程序崩溃。
- 合理使用并行 ：利用 `Promise.all` 或 `Promise.race` 提升性能。
- 避免阻塞事件循环 ：拆分 CPU 密集型任务，避免过长的同步操作。

## 总结

JavaScript 异步编程经历了从 回调 → Promise → Async/Await 的演进，开发者可以根据场景选择合适方案。理解事件循环和任务队列是掌握异步编程的关键。
