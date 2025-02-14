# JavaScript 异步编程详解

## 目录

1. **同步 vs 异步**
2. **回调函数（Callbacks）**
3. **Promise**
4. **Async/Await**
5. **事件循环（Event Loop）**
6. **其他异步操作（定时器、事件监听器）**
7. **错误处理**
8. **最佳实践**

---

## 1. 同步 vs 异步

### 同步代码

- **按顺序执行**，阻塞后续代码直到当前任务完成。
- 示例：
  ```javascript
  console.log("Start");
  const result = calculateSync(); // 假设这是一个耗时操作
  console.log("Result:", result);
  console.log("End");
  // 输出顺序：Start → Result → End
  ```

### 异步代码

- **非阻塞执行**，任务完成后通过回调通知结果。
- 示例：
  ```javascript
  console.log("Start");
  setTimeout(() => console.log("Timeout完成"), 1000);
  console.log("End");
  // 输出顺序：Start → End → Timeout完成
  ```

---

## 2. 回调函数（Callbacks）

### 基本用法

- 将函数作为参数传递给异步操作，操作完成后调用。
- 示例：
  ```javascript
  function fetchData(callback) {
    setTimeout(() => {
      callback("数据加载完成");
    }, 1000);
  }

  fetchData((data) => console.log(data)); // 1秒后输出
  ```

### 回调地狱（Callback Hell）

- 多层嵌套回调导致代码难以维护。
- 示例：
  ```javascript
  getUser(userId, (user) => {
    getPosts(user.id, (posts) => {
      getComments(posts[0].id, (comments) => {
        console.log(comments);
      });
    });
  });
  ```

---

## 3. Promise

### 基本概念

- Promise 是一个对象，表示异步操作的最终完成或失败。
- 三种状态：`pending`、`fulfilled`、`rejected`。

### 基本用法

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    success ? resolve("成功!") : reject("失败!");
  }, 1000);
});

promise
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
```

### Promise 链式调用

```javascript
fetch(url)
  .then(response => response.json())
  .then(data => processData(data))
  .then(result => console.log(result))
  .catch(error => console.error("链中任何错误:", error));
```

### Promise 静态方法

- **`Promise.all`**: 所有 Promise 成功时返回结果数组。
  ```javascript
  Promise.all([promise1, promise2, promise3])
    .then(results => console.log(results))
    .catch(error => console.error(error));
  ```

- **`Promise.race`**: 第一个完成（无论成功/失败）的 Promise。
  ```javascript
  Promise.race([promise1, promise2])
    .then(result => console.log("第一个完成的结果:", result));
  ```

---

## 4. Async/Await

### 基于 Promise 的语法糖

- 用同步写法处理异步操作。
- 示例：
  ```javascript
  async function fetchData() {
    try {
      const response = await fetch('https://api.example.com/data');
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("捕获错误:", error);
    }
  }
  fetchData();
  ```

### 并行执行

```javascript
async function parallelTasks() {
  const [data1, data2] = await Promise.all([task1(), task2()]);
  console.log(data1, data2);
}
```

---

## 5. 事件循环（Event Loop）

### 执行机制

1. **调用栈（Call Stack）**：执行同步代码。
2. **任务队列（Task Queue）**：存放宏任务（如 `setTimeout`）。
3. **微任务队列（Microtask Queue）**：存放微任务（如 `Promise.then`）。

### 执行顺序示例

```javascript
console.log("Start");

setTimeout(() => console.log("Timeout"), 0);

Promise.resolve()
  .then(() => console.log("Promise 1"))
  .then(() => console.log("Promise 2"));

console.log("End");

// 输出顺序:
// Start → End → Promise 1 → Promise 2 → Timeout
```

---

## 6. 其他异步操作

### 定时器

```javascript
setTimeout(() => console.log("延时1秒"), 1000);
setInterval(() => console.log("每秒执行"), 1000);
```

### 事件监听器

```javascript
button.addEventListener('click', () => {
  console.log("按钮被点击");
});
```

---

## 7. 错误处理

### 回调中的错误处理

```javascript
fs.readFile('file.txt', (err, data) => {
  if (err) return console.error(err);
  console.log(data);
});
```

### Promise 错误处理

```javascript
fetchData()
  .then(data => console.log(data))
  .catch(err => console.error("捕获错误:", err))
  .finally(() => console.log("清理操作"));
```

### Async/Await 错误处理

```javascript
async function loadData() {
  try {
    const data = await fetchData();
  } catch (err) {
    console.error(err);
  }
}
```

---

## 8. 最佳实践

1. **避免回调地狱**：使用 Promise 或 Async/Await。
2. **始终处理错误**：添加 `.catch()` 或 `try/catch`。
3. **合理使用并行**：`Promise.all` 提升性能。
4. **避免阻塞事件循环**：拆分 CPU 密集型任务。

---

## 总结

JavaScript 异步编程经历了从 **回调 → Promise → Async/Await** 的演进，开发者可以根据场景选择合适方案。理解事件循环和任务队列是掌握异步编程的关键。
