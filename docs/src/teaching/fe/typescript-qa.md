# TypeScript 面试常见问题汇总

## 一、基础概念

### 1. TypeScript 是什么？

TypeScript 是由微软开发的一种开源编程语言，它是 JavaScript 的严格超集，添加了类型系统和对 ES6+ 特性的支持。TypeScript 旨在解决 JavaScript 开发中的一些常见问题，如动态类型导致的 bug 和代码难以维护等。通过引入静态类型系统，TypeScript 使得代码更易于理解、维护和调试。

### 2. TypeScript 的主要特点是什么？

- **静态类型系统**：TypeScript 的核心特点是其静态类型系统，能够在编译阶段发现潜在的类型错误。
- **类型推断**：TypeScript 支持类型推断，编译器可以根据赋值语句推断变量的类型。
- **面向对象编程**：TypeScript 支持基于类的面向对象编程，包括封装、继承和多态等特性。
- **模块化**：TypeScript 支持 ES6 模块语法，使用 import 和 export 关键字来导入和导出模块。
- **丰富的生态系统**：TypeScript 拥有丰富的生态系统，包括各种工具、插件和库，支持开发者在不同场景下的需求。

### 3. TypeScript 与 JavaScript 的关系是什么？

TypeScript 是 JavaScript 的严格超集，这意味着任何有效的 JavaScript 代码也是有效的 TypeScript 代码。TypeScript 添加了类型系统和其他特性，使得代码更加健壮和可维护。

## 二、类型系统

### 4. TypeScript 的基础类型有哪些？

TypeScript 支持以下基础类型：

- **number**：数字类型，包括整数和浮点数。
- **string**：字符串类型，表示文本。
- **boolean**：布尔类型，值为 true 或 false。
- **array**：数组类型，可以用 T[] 或 Array\<T\> 表示。
- **tuple**：元组类型，表示已知数量和类型的数组，例如 [string, number]。
- **enum**：枚举类型，用于定义一组命名常量。
- **any**：表示任意类型，用于绕过类型检查。
- **void**：表示没有返回值的函数。
- **null 和 undefined**：分别表示空值和未定义。

### 5. 什么是联合类型和交叉类型？

- **联合类型（Union Types）**：允许变量可以是多种类型之一，用 | 表示。

```TypeScript
let value: string | number;
value = "Hello";  // 合法
value = 42;  // 合法
```

- **交叉类型（Intersection Types）**：将多个类型合并为一个类型，用 & 表示。它通常用于对象的类型组合。

```TypeScript
interface Person {
    name: string;
}
interface Employee {
    employeeId: number;
}
type Worker = Person & Employee;
const worker: Worker = { name: "Alice", employeeId: 123 };
```

### 6. 什么是可选属性和只读属性？

- **可选属性**：通过在属性名后加 ? 表示。

```TypeScript
interface User {
    username: string;
    age?: number;  // age 是可选的
}
```

- **只读属性**：使用 readonly 关键字声明只读属性，赋值后不可修改。

```TypeScript
interface User {
    readonly id: number;
    username: string;
}
```

## 三、函数与类

### 7. 如何为函数的参数和返回值指定类型？

在 TypeScript 中，可以为函数的参数和返回值指定类型，以确保函数的输入和输出符合预期。例如：

```TypeScript
function add(a: number, b: number): number {
  return a + b;
}
```

### 8. 如何定义类和继承？

TypeScript 支持面向对象编程，可以通过类来定义对象的属性和方法，并使用继承来复用代码。例如：

```TypeScript
class Animal {
  constructor(public name: string) {}
  move(distance: number = 0) {
    console.log(`${this.name} moved ${distance} meters.`);
  }
}

class Dog extends Animal {
  bark() {
    console.log(`${this.name} barks.`);
  }
}
```

### 9. 什么是访问修饰符？

TypeScript 提供了 public、protected 和 private 三种访问修饰符，用于控制类成员的访问权限。例如：

```TypeScript
class Person {
  private name: string;
  protected age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  public getInfo(): string {
    return `${this.name} is ${this.age} years old.`;
  }
}
```

## 四、泛型

### 10. 什么是泛型？

泛型（Generics）是 TypeScript 中的一种强大特性，允许在定义函数、接口或类时不预先指定具体的类型，而是在使用时通过指定具体的类型来传递给这些结构。泛型使得类型能够在使用时灵活地变化，避免了代码重复并提高了类型安全。

### 11. 泛型的作用是什么？

泛型的主要作用是提高代码的可重用性和灵活性。在不牺牲类型安全的情况下，泛型可以让开发者编写更具通用性的代码，而不需要为每种数据类型编写重复的代码。

### 12. 泛型的使用场景有哪些？

- **函数**：可以通过泛型函数处理不同类型的数据，且保持类型安全。
- **接口**：通过泛型接口可以定义一组适用于不同类型的函数或数据结构。
- **类**：泛型类使得类可以操作不同类型的数据，而不需要重复定义类的实现。

### 13. 泛型的语法是什么？

- **泛型函数**：通过尖括号 <> 定义泛型类型。
- **泛型接口**：在接口中使用泛型，使得接口可以接受多种不同类型。
- **泛型类**：通过泛型使得类的实例可以操作不同的数据类型。

### 14. 泛型的示例

- 泛型函数

```TypeScript
function identity<T>(value: T): T {
  return value;
}

const num = identity(42); // T 被推断为 number
const str = identity("hello"); // T 被推断为 string
```

- 泛型接口

```TypeScript
interface Box<T> {
  value: T;
}

const numberBox: Box<number> = { value: 42 };
const stringBox: Box<string> = { value: "hello" };
```

- 泛型类

```TypeScript
class GenericBox<T> {
  value: T;

  constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }
}

const box = new GenericBox<number>(42);
console.log(box.getValue()); // 输出 42
```

## 五、模块化

### 15. TypeScript 如何支持模块化？

TypeScript 支持 ES6 模块语法，使用 import 和 export 关键字来导入和导出模块。例如：

```TypeScript
// mathUtils.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}
```

```TypeScript
// app.ts
import { add, subtract } from "./mathUtils";

console.log(add(5, 3)); // 输出: 8
console.log(subtract(5, 3)); // 输出: 2
```

### 16. 如何配置模块解析？

在 tsconfig.json 中，可以通过 module 和 moduleResolution 选项来配置模块解析方式。例如：

```JSON
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node"
  }
}
```

## 六、装饰器

### 17. 什么是装饰器？

装饰器（Decorators）是 TypeScript 中一种实验性特性，用于在类、方法、属性和参数上添加元数据和行为。装饰器通过在代码中添加注解的方式，使得代码更加简洁和易于维护。

### 18. 装饰器的使用场景有哪些？

- **类装饰器**：用于在类上添加元数据或行为。
- **方法装饰器**：用于在方法上添加元数据或行为。
- **属性装饰器**：用于在属性上添加元数据或行为。
- **参数装饰器**：用于在方法参数上添加元数据或行为。

### 19. 装饰器的示例

- 类装饰器

```TypeScript
function logClass(target: Function) {
  console.log(`Logging class: ${target.name}`);
}

@logClass
class MyClass {}
```

## 七、编译配置

### 20. tsconfig.json 配置选项有哪些？

tsconfig.json 是 TypeScript 项目的核心配置文件，用于指定编译器的行为。常见的配置选项包括：

- **target**：指定编译后的 JavaScript 版本。
- **module**：指定模块系统。
- **strict**：启用严格类型检查。
- **esModuleInterop**：启用 ES 模块互操作。
- **skipLibCheck**：跳过库文件的类型检查。
- **forceConsistentCasingInFileNames**：强制文件名大小写一致。

### 21. tsconfig.json 示例

```JSON
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## 八、工程化实践

### 22. TypeScript 与 JavaScript 如何混用？

在实际项目中，TypeScript 和 JavaScript 可以混用。通过在 tsconfig.json 中配置 allowJs 选项，可以允许 TypeScript 编译器处理 JavaScript 文件。例如：

```JSON
{
  "compilerOptions": {
    "allowJs": true
  }
}
```

### 23. 如何处理第三方库的类型定义？

对于第三方库，可以通过安装类型定义文件（.d.ts 文件）来提供类型支持。例如，使用 @types 包来安装库的类型定义：

```bash
npm install @types/react
```

## 九、常见问题总结

### 24. interface 和 type 的区别是什么？

#### 定义方式：

- interface 主要用于定义对象的形状，支持继承。
- type 用于定义任意类型，包括原始类型、联合类型、元组等，不支持继承。

#### 联合类型和交叉类型：

- interface 不能直接表达联合类型。
- type 可以直接定义联合类型。

#### 声明合并：

- interface 支持声明合并。
- type 不支持声明合并。

#### 使用场景：

- interface 更适合定义对象结构，尤其是需要继承和合并时。
- type 更适合用于简单的类型定义和复杂的类型组合。

### 25. TypeScript 的类型系统有哪些特点？

TypeScript 的类型系统包括基础类型、联合类型、交叉类型、接口、类型别名等。通过这些类型，可以定义复杂的类型结构，提高代码的可读性和可维护性。

### 26. 泛型的作用是什么？

泛型是 TypeScript 中的一种强大特性，允许在定义函数、接口或类时不预先指定具体的类型，而是在使用时通过指定具体的类型来传递给这些结构。泛型使得类型能够在使用时灵活地变化，避免了代码重复并提高了类型安全。

### 27. 模块化如何提高代码的可维护性？

TypeScript 支持 ES6 模块语法，使用 import 和 export 关键字来导入和导出模块。通过模块化，可以将代码分割成独立的模块文件，实现代码的复用和隔离。

### 28. 装饰器的使用场景有哪些？

装饰器是 TypeScript 中一种实验性特性，用于在类、方法、属性和参数上添加元数据和行为。装饰器通过在代码中添加注解的方式，使得代码更加简洁和易于维护。

## 十、总结

TypeScript 在前端开发中的作用日益重要，掌握 TypeScript 的基础和进阶知识是成为优秀前端开发者的必备技能。在面试中，面试官通常会从静态类型、类型系统、泛型等基础问题开始，逐渐深入到实际项目中的问题，如类型推断和类型守卫等。因此，准备 TypeScript 面试题时，应注重理论知识与实战应用的结合。
