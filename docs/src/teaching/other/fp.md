# 函数式编程（Functional Programming，FP）概述

函数式编程（Functional Programming，简称FP）是一种编程范式，它强调使用纯函数和不可变数据来处理程序逻辑。与命令式编程不同，函数式编程通过组合函数来构建复杂的程序，而不依赖于状态和副作用。

函数式编程的核心思想

* 纯函数（Pure Functions）：纯函数是指一个函数的输出仅依赖于输入，并且没有副作用。副作用包括修改外部状态、输出日志、与外部世界交互等。
* 不可变性（Immutability）：数据在函数式编程中是不可变的。任何对数据的修改都不会改变原数据，而是生成一个新的数据。
* 高阶函数（Higher-Order Functions）：高阶函数是指接受一个或多个函数作为参数，或者返回一个函数的函数。
* 函数组合（Function Composition）：函数组合是将多个小函数通过组合形成一个更复杂的函数，避免了对状态和副作用的依赖。
* 惰性求值（Lazy Evaluation）：惰性求值意味着表达式的计算被推迟，直到其结果被真正需要时才进行计算。

## 一、函数式编程的主要特点

### 1. 纯函数（Pure Functions）

纯函数的输出仅由输入决定，不会依赖外部状态，并且不会改变外部状态。纯函数不会有副作用。
示例：

``` typescript
复制代码
// 纯函数示例：加法
const add = (a: number, b: number): number => a + b;

// 调用纯函数
console.log(add(2, 3));  // 输出: 5
```

* 在这个例子中，add函数是纯函数，因为它只依赖于输入参数，且没有副作用。

### 2. 不可变性（Immutability）

数据不可变意味着一旦数据被创建，它就不能被改变。修改数据时，我们会创建一个新的数据，而不会修改原数据。

示例：

``` typescript
// 不可变性示例：修改数组
const numbers = [1, 2, 3];

// 使用扩展运算符来创建新数组
const newNumbers = [...numbers, 4];  // 创建一个新的数组
console.log(numbers);   // 输出: [1, 2, 3]
console.log(newNumbers); // 输出: [1, 2, 3, 4]
```

* 在这个例子中，我们没有修改原始数组numbers，而是通过扩展运算符创建了一个新数组newNumbers。

### 3. 高阶函数（Higher-Order Functions）

高阶函数是指接受一个或多个函数作为参数，或者返回一个函数作为结果的函数。高阶函数允许函数作为数据处理。

示例：

``` typescript
// 高阶函数示例：函数作为参数
const map = <T, U>(arr: T[], fn: (value: T) => U): U[] => {
    const result: U[] = [];
    for (let i = 0; i < arr.length; i++) {
        result.push(fn(arr[i]));
    }
    return result;
}

const numbers = [1, 2, 3];
const doubledNumbers = map(numbers, (x) => x * 2); // 使用高阶函数map
console.log(doubledNumbers);  // 输出: [2, 4, 6]
```

* 这里，map是一个高阶函数，它接受一个函数fn作为参数，并对数组arr中的每个元素应用该函数。

### 4. 函数组合（Function Composition）

函数组合指的是将多个小函数组合成一个更复杂的函数。函数的输出作为下一个函数的输入，形成流水线式的数据处理。

示例：

``` typescript
// 函数组合示例
const compose = <T>(...fns: ((x: T) => T)[]): (x: T) => T => {
    return (x: T) => fns.reduceRight((acc, fn) => fn(acc), x);
}

const add5 = (x: number): number => x + 5;
const multiplyBy2 = (x: number): number => x * 2;

const combinedFunction = compose(multiplyBy2, add5);

console.log(combinedFunction(3));  // 输出: 16
```

* 在这个例子中，我们定义了一个compose函数，它将add5和multiplyBy2两个函数组合成一个新的函数。通过compose(multiplyBy2, add5)，我们可以先加5再乘2。

### 5. 惰性求值（Lazy Evaluation）

惰性求值意味着在表达式被需要时才计算它的结果，这对于处理大规模数据时非常有用，可以避免不必要的计算。

示例：

``` typescript
// 惰性求值示例
const lazySquare = (x: number) => () => x * x;  // 返回一个延迟执行的函数
const lazyAdd = (x: number, y: number) => () => x + y;

const result1 = lazySquare(4);
const result2 = lazyAdd(2, 3);

console.log(result1());  // 输出: 16
console.log(result2());  // 输出: 5
```

* 在这个例子中，lazySquare和lazyAdd返回的是函数，它们的计算会推迟到实际调用时。

## 二、函数式编程的常用概念

### 1. 函数柯里化（Currying）

函数柯里化是指将接受多个参数的函数转换为一系列接受单一参数的函数的技术。柯里化可以使得函数的复用性更强。

示例：

``` typescript
// 函数柯里化示例
const multiply = (a: number) => (b: number) => a * b;

const double = multiply(2);
console.log(double(5));  // 输出: 10

const triple = multiply(3);
console.log(triple(5));  // 输出: 15
```

* 在这里，multiply函数被柯里化为一个接受一个参数并返回另一个接受一个参数的函数。

### 2. 函数组合（Function Composition）

函数组合是将多个小的函数通过组合的方式创建一个新的函数。这个新函数由多个原函数按照一定顺序组合而成。

示例：

``` typescript
// 函数组合示例
const compose = <T>(...fns: ((x: T) => T)[]): (x: T) => T => {
    return (x: T) => fns.reduceRight((acc, fn) => fn(acc), x);
}

const add = (x: number): number => x + 2;
const multiply = (x: number): number => x * 3;

const composedFunction = compose(multiply, add);
console.log(composedFunction(5));  // 输出: 21  ==> (5 + 2) * 3
```

## 三、常见的函数式编程模式

### 1. Map、Filter、Reduce

* map：对数组中的每个元素进行处理并返回一个新数组。
* filter：过滤掉不符合条件的元素，返回符合条件的元素组成的新数组。
* reduce：通过一个累积的方式将数组的所有元素聚合成一个结果。

示例：

``` typescript
const numbers = [1, 2, 3, 4, 5];

// 使用 map 将每个数乘以2
const doubled = numbers.map(num => num * 2);
console.log(doubled);  // 输出: [2, 4, 6, 8, 10]

// 使用 filter 过滤出大于2的数
const greaterThanTwo = numbers.filter(num => num > 2);
console.log(greaterThanTwo);  // 输出: [3, 4, 5]

// 使用 reduce 计算数组总和
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum);  // 输出: 15
```

### 2. 函数缓存（Memoization）

缓存技术用于避免重复计算，尤其在有大量重复计算的情况下。通过缓存每次调用函数的结果来提高性能。

示例：

``` typescript
const memoize = <T>(fn: (arg: number) => T): (arg: number) => T => {
    const cache: Record<number, T> = {};
    return (arg: number): T => {
        if (cache[arg]) {
            return cache[arg];
        } else {
            const result = fn(arg);
            cache[arg] = result;
            return result;
        }
    };
};

const slowFunction = (x: number): number => {
    console.log("Calculating...");
    return x * x;
};

const fastFunction = memoize(slowFunction);

console.log(fastFunction(5));  // 输出: Calculating... 25
console.log(fastFunction(5));  // 输出: 25 (不再计算)
```

## 总结

函数式编程（FP）通过纯函数、不可变数据、高阶函数、惰性求值等技术强调函数的计算方式。它减少了副作用、增强了代码的可测试性和可重用性，并且通过函数组合和高阶函数实现了灵活的代码结构。通过函数式编程，可以写出更简洁、更易于维护的代码。
