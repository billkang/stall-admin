# 函数式编程（Functional Programming，FP）概述

函数式编程是一种编程范式，它强调使用纯函数、不可变数据结构和避免副作用来构建程序。FP 通过组合简单的函数来创建复杂的逻辑，这种方式可以带来更清晰的代码结构、更好的测试性和更高的可维护性。

## 函数式编程的核心思想

- **纯函数（Pure Functions）**：一个纯函数的输出仅依赖于它的输入参数，并且不会引起任何外部状态的变化或副作用。
- **不可变性（Immutability）**：在 FP 中，数据一旦被创建就不能被改变；所有的“修改”操作都会返回新的数据副本，而原始数据保持不变。
- **高阶函数（Higher-Order Functions）**：这些函数接受其他函数作为参数，或者返回函数作为结果，这允许了函数作为一等公民参与运算。
- **函数组合（Function Composition）**：将多个小函数连接起来形成更大的功能块，每个小函数负责处理特定的任务。
- **惰性求值（Lazy Evaluation）**：只在必要时才计算表达式的值，这有助于优化性能并处理无限序列等场景。

## 一、函数式编程的主要特点

### 1. 纯函数（Pure Functions）

纯函数是函数式编程的基础之一，它们具有以下特性：

- 给定相同的输入总是产生相同的输出。
- 没有副作用，即不会修改外部变量或执行 I/O 操作。

```typescript
// 纯函数示例：加法
function add(a: number, b: number): number {
    return a + b;
}

console.log(add(2, 3)); // 输出: 5
```

在这个例子中，`add` 函数是一个纯函数，因为它只依赖于输入参数，而且没有任何副作用。

### 2. 不可变性（Immutability）

在 FP 中，数据通常是不可变的，这意味着一旦创建了一个对象，就不能直接修改它。相反，如果你需要更改某个值，则会创建一个新的对象来表示这个变化。

```typescript
// 不可变性示例：修改数组
const numbers = [1, 2, 3];

// 使用扩展运算符来创建新数组而不改变原数组
const newNumbers = [...numbers, 4];
console.log(numbers);   // 输出: [1, 2, 3]
console.log(newNumbers); // 输出: [1, 2, 3, 4]
```

这里我们没有改变 `numbers` 数组，而是创建了一个包含额外元素的新数组 `newNumbers`。

### 3. 高阶函数（Higher-Order Functions）

高阶函数是指那些可以接收函数作为参数或者返回函数作为结果的函数。这种特性使得我们可以把函数当作值一样传递和操作。

```typescript
// 高阶函数示例：函数作为参数
function map<T, U>(arr: T[], fn: (value: T) => U): U[] {
    const result: U[] = [];
    for (let i = 0; i < arr.length; i++) {
        result.push(fn(arr[i]));
    }
    return result;
}

const numbers = [1, 2, 3];
const doubledNumbers = map(numbers, x => x * 2);
console.log(doubledNumbers); // 输出: [2, 4, 6]
```

在这个例子中，`map` 是一个高阶函数，因为它接受另一个函数 `fn` 作为参数，并将其应用于数组中的每一个元素。

### 4. 函数组合（Function Composition）

函数组合是 FP 的一个重要概念，它指的是将几个简单的小函数串联在一起形成一个新的复合函数。

```typescript
// 函数组合示例
function compose<T>(...fns: ((x: T) => T)[]): (x: T) => T {
    return fns.reduceRight((composedFn, nextFn) => (x: T) => nextFn(composedFn(x)));
}

const addFive = (x: number): number => x + 5;
const multiplyByTwo = (x: number): number => x * 2;

const combinedFunction = compose(multiplyByTwo, addFive);
console.log(combinedFunction(3)); // 输出: 16
```

在这里，我们定义了一个 `compose` 函数，它可以将两个函数 `multiplyByTwo` 和 `addFive` 组合成一个新的函数 `combinedFunction`，先执行 `addFive` 再执行 `multiplyByTwo`。

### 5. 惰性求值（Lazy Evaluation）

惰性求值意味着推迟表达式的求值直到其结果真正被需要的时候。这对于优化性能特别有用，尤其是在处理可能永远不会用到的数据流或集合时。

```typescript
// 惰性求值示例
function lazySquare(x: number): () => number {
    return () => x * x;
}

const squareOfFour = lazySquare(4);
console.log(squareOfFour()); // 输出: 16
```

在这个例子中，`lazySquare` 返回的是一个闭包，它会在调用时才计算平方值。

## 二、函数式编程的常用概念

### 1. 函数柯里化（Currying）

函数柯里化是将一个多参数函数转换成一系列单参数函数的过程。这样做可以让函数更加灵活，因为你可以逐步提供参数，直到所有必需的参数都被提供为止。

```typescript
// 函数柯里化示例
function curryMultiply(a: number): (b: number) => number {
    return function(b: number): number {
        return a * b;
    };
}

const double = curryMultiply(2);
console.log(double(5)); // 输出: 10

const triple = curryMultiply(3);
console.log(triple(5)); // 输出: 15
```

上面的例子展示了如何将 `curryMultiply` 函数柯里化为 `double` 和 `triple` 函数。

### 2. 函数组合（Function Composition）

正如前面提到的，函数组合是将多个函数串联起来以创建新的复合函数的技术。这可以通过递归地应用各个函数来实现。

```typescript
// 函数组合示例
function compose<T>(...fns: ((x: T) => T)[]): (x: T) => T {
    return fns.reduceRight((composedFn, nextFn) => (x: T) => nextFn(composedFn(x)));
}

const addTwo = (x: number): number => x + 2;
const multiplyThree = (x: number): number => x * 3;

const composedFunction = compose(multiplyThree, addTwo);
console.log(composedFunction(5)); // 输出: 21  ==> (5 + 2) * 3
```

## 三、常见的函数式编程模式

### 1. Map、Filter、Reduce

这些是处理集合（如数组）时常用的高阶函数，它们分别用于映射、过滤和聚合数据。

- **Map**：对集合中的每一项应用一个函数，并返回一个新的集合。
- **Filter**：根据条件筛选出集合中的某些项，并返回一个新的集合。
- **Reduce**：通过对集合中的所有项累积操作，最终得到一个单一的结果。

```typescript
const numbers = [1, 2, 3, 4, 5];

// 使用 map 将每个数乘以2
const doubled = numbers.map(num => num * 2);
console.log(doubled); // 输出: [2, 4, 6, 8, 10]

// 使用 filter 过滤出大于2的数
const greaterThanTwo = numbers.filter(num => num > 2);
console.log(greaterThanTwo); // 输出: [3, 4, 5]

// 使用 reduce 计算数组总和
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 输出: 15
```

### 2. 函数缓存（Memoization）

函数缓存是一种优化技术，它通过存储函数调用的结果来避免重复计算。当同一个输入再次传入时，可以直接从缓存中获取结果，而不是重新计算。

```typescript
function memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map<string, ReturnType<T>>();
    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = JSON.stringify(args);
        if (!cache.has(key)) {
            cache.set(key, fn(...args));
        }
        return cache.get(key) as ReturnType<T>;
    }) as T;
}

const slowFunction = (x: number): number => {
    console.log("Calculating...");
    return x * x;
};

const fastFunction = memoize(slowFunction);

console.log(fastFunction(5)); // 输出: Calculating... 25
console.log(fastFunction(5)); // 输出: 25 (不再计算)
```

## 总结

函数式编程提供了一种强大的方式来思考和编写代码，它鼓励使用纯函数、不可变数据和高阶函数来构建程序。这种方法不仅可以提高代码的质量，还可以简化调试和测试过程。通过理解 FP 的核心原则和技术，开发者可以写出更简洁、更具表现力和更易于维护的代码。此外，许多现代 JavaScript 库和框架也广泛采用了 FP 的理念，因此掌握 FP 对于今天的开发人员来说是非常有价值的技能。
