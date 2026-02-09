# PerformanceObserver 和 Performance API 的区别与应用场景

在前端性能监测与优化领域，PerformanceObserver 和 Performance API 是两个核心工具，它们相辅相成，为开发者提供了全面的性能监测能力。下面将从多个维度剖析它们的差异，并结合实际场景探讨各自的应用价值。

## 一、定义与功能概述

### Performance API

Performance API 是一组浏览器提供的接口，用于测量和分析 Web 应用的性能指标。它允许开发者获取详细的性能时间戳、资源加载数据以及自定义性能测量点。通过 Performance API，开发者可以深入了解页面加载的各个阶段、资源的加载情况以及用户交互的性能表现。具体来说，它提供了以下关键功能：

1. **性能时间戳获取**：通过 `performance.timing` 接口，开发者可以获取页面加载过程中的各个时间点，如导航开始时间、DOM 内容加载时间、页面加载完成时间等。这些时间戳帮助开发者精确分析页面加载的每个环节，找出潜在的性能瓶颈。
2. **资源性能数据获取**：利用 `performance.getEntriesByType('resource')`，开发者可以获取所有资源（如 JS、CSS、图片等）的加载性能数据，包括资源的加载时间、开始时间、结束时间等。这有助于识别加载缓慢的资源，从而进行针对性的优化。
3. **自定义性能测量**：通过 `performance.mark()` 和 `performance.measure()`，开发者可以在代码中手动创建标记和测量，用于记录特定事件的开始和结束时间。例如，在一个复杂的计算任务前后添加标记，测量该任务的执行时间，以便评估其对性能的影响。

### PerformanceObserver

PerformanceObserver 是 Performance API 的一个高级特性，它允许开发者实时监听和响应性能事件。与直接操作 Performance API 获取静态数据不同，PerformanceObserver 更侧重于动态监测性能变化。它的核心功能包括：

1. **性能事件监听**：开发者可以使用 `PerformanceObserver` 监听特定类型的性能条目，如页面导航、资源加载、长任务等。当这些事件发生时，`PerformanceObserver` 会触发回调函数，使开发者能够实时获取和处理性能数据。
2. **实时性能数据分析**：通过监听性能事件，开发者可以实时分析应用的性能表现，例如监测资源加载时间、页面渲染时间等。这对于需要动态调整性能策略的应用场景非常有用，如在页面加载过程中根据资源加载情况动态调整加载优先级。
3. **性能优化与问题定位**：`PerformanceObserver` 提供的实时数据可以帮助开发者及时发现性能问题，如长时间运行的任务、资源加载失败等，并采取相应的优化措施。例如，当检测到某个资源加载时间过长时，可以考虑使用 CDN 或者进行资源压缩。

## 二、区别与联系

### 数据获取方式

- **Performance API**：主要用于获取已经发生的性能数据，这些数据在页面加载过程中被浏览器记录下来，开发者可以通过调用相应的 API 方法来获取这些数据。例如，`performance.getEntries()` 可以获取所有性能条目，`performance.timing` 可以获取页面加载的时间戳信息。这种方式适合在页面加载完成后进行整体性能分析。
- **PerformanceObserver**：用于实时监听性能事件，当特定的性能条目被记录时，会触发回调函数，开发者可以在回调中处理这些实时数据。这种方式适合在页面加载过程中动态监测性能变化，及时响应性能事件。

### 实时性

- **Performance API**：获取的是已经记录的性能数据，具有一定的滞后性，无法实时反映当前的性能状态。例如，`performance.timing` 中的页面加载时间是在页面加载完成后才能获取的。
- **PerformanceObserver**：能够实时监测性能事件，当性能条目被记录时立即触发回调，具有较高的实时性。例如，当一个资源开始加载时，`PerformanceObserver` 可以立即捕获到这个事件，并在回调中进行处理。

### 使用复杂度

- **Performance API**：使用相对简单，直接调用相应的 API 方法即可获取所需的性能数据。例如，获取资源加载性能数据只需调用 `performance.getEntriesByType('resource')`。
- **PerformanceObserver**：需要先创建 `PerformanceObserver` 实例，然后通过 `observe` 方法指定要监听的性能条目类型，并提供回调函数来处理捕获到的性能数据。使用上稍微复杂一些，但提供了更大的灵活性和实时性。

## 三、应用场景

### Performance API

1. **页面加载性能分析**：在页面加载完成后，使用 `performance.timing` 获取页面加载的各个时间点，计算页面加载总耗时、DNS 查询耗时、TCP 连接耗时等指标，分析页面加载性能。例如：

   ```javascript
   const performanceTiming = performance.timing;
   const pageLoadTime =
     performanceTiming.loadEventEnd - performanceTiming.navigationStart;
   console.log('页面加载总耗时:', pageLoadTime);
   ```

2. **资源加载性能监测**：使用 `performance.getEntriesByType('resource')` 获取所有资源的加载性能数据，找出加载时间过长的资源，进行优化。例如：

   ```javascript
   const resourceEntries = performance.getEntriesByType('resource');
   resourceEntries.forEach((entry) => {
     console.log(`资源 ${entry.name} 加载耗时: ${entry.duration}ms`);
   });
   ```

3. **自定义性能测量**：在代码中使用 `performance.mark()` 和 `performance.measure()` 添加自定义标记和测量，分析特定代码块的执行时间。例如：

   ```javascript
   performance.mark('start');
   // 模拟复杂计算
   for (let i = 0; i < 1000000; i++) {
     const result = Math.sqrt(i);
   }
   performance.mark('end');
   performance.measure('complex-calculation', 'start', 'end');
   const measures = performance.getEntriesByType('measure');
   console.log('复杂计算耗时:', measures[0].duration);
   ```

### PerformanceObserver

1. **实时性能监控**：在页面加载过程中，实时监听资源加载、页面导航等性能事件，及时发现性能问题。例如，监听资源加载事件，当发现某个资源加载时间过长时，可以动态调整加载策略，如取消加载或者切换到备用资源：

   ```javascript
   const observer = new PerformanceObserver((list) => {
     const entries = list.getEntries();
     entries.forEach((entry) => {
       console.log(`资源 ${entry.name} 加载耗时: ${entry.duration}ms`);
     });
   });
   observer.observe({ type: 'resource' });
   ```

2. **长任务监测**：监听 `longtask` 类型的性能条目，及时发现长时间运行的任务，避免页面卡顿。例如，当检测到某个任务运行时间过长时，可以考虑将其拆分为多个小任务，使用 `setTimeout` 或 `requestIdleCallback` 进行优化：

   ```javascript
   const longTaskObserver = new PerformanceObserver((list) => {
     const entries = list.getEntries();
     entries.forEach((entry) => {
       console.log(`检测到长任务，耗时: ${entry.duration}ms`);
     });
   });
   longTaskObserver.observe({ entryTypes: ['longtask'] });
   ```

3. **用户交互性能监测**：监听用户交互相关的性能事件，如点击、滚动等，分析用户操作的响应时间。例如，监测按钮点击后的响应时间，优化交互体验：

   ```javascript
   const interactionObserver = new PerformanceObserver((list) => {
     const entries = list.getEntries();
     entries.forEach((entry) => {
       console.log(`交互事件 ${entry.name} 响应耗时: ${entry.duration}ms`);
     });
   });
   interactionObserver.observe({ type: 'event', durationThreshold: 0 });
   ```

## 四、总结

Performance API 和 PerformanceObserver 是前端性能监测的两大利器。Performance API 提供了丰富的接口来获取页面加载、资源加载等性能数据，适合在页面加载完成后进行整体性能分析。PerformanceObserver 则侧重于实时监听性能事件，提供更高的实时性和灵活性，适合在页面加载过程中动态监测性能变化。在实际开发中，两者往往结合使用，先使用 Performance API 获取整体性能数据，再使用 PerformanceObserver 实时监测关键性能事件，从而全面掌握应用的性能表现，及时发现并解决性能问题。
