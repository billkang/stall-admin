# TypeScript 高级编程：面向对象与高级特性详解

## 一、引言

在上一篇文章中，我们对 TypeScript 的基础内容进行了全面的介绍，涵盖了其核心概念、基本语法以及类型系统等重要知识。然而，TypeScript 的强大功能和高级特性还远未被完全挖掘。

本文将从以下几个方面深入探讨 TypeScript 的高级特性：

1. 面向对象编程的高级概念
2. 高级类型的应用
3. TypeScript 的内置工具类型
4. 装饰器的全面解析
5. type 和 interface 的异同与使用场景

通过本文的学习，您将不仅掌握 TypeScript 的高级特性，还能深入理解其在实际项目中的应用价值。无论您是初学者还是有一定经验的开发者，本文都将帮助您进一步提升在 TypeScript 领域的专业技能，为您的开发工作增添更多助力。

## 二、面向对象编程

### （一）类的基本结构

```typescript
class Person {
  // 属性
  name: string;
  age: number;

  // 构造函数
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  // 方法
  greet() {
    console.log(`Hello, my name is ${this.name}`);
  }
}

// 创建对象
const person = new Person("Alice", 30);
person.greet(); // 输出: Hello, my name is Alice
```

### （二）访问修饰符

TypeScript 引入了访问修饰符，用于控制类的成员（属性和方法）的访问权限。主要有以下三种访问修饰符：

1. **public（公共）**：默认情况下，类的成员都是 public 的，可以在任何地方访问。
2. **private（私有）**：只能在类的内部访问。
3. **protected（受保护）**：可以在类的内部和子类中访问，但不能在类的外部访问。

```typescript
class Employee {
  public name: string;
  private salary: number;
  protected department: string;

  constructor(name: string, salary: number, department: string) {
    this.name = name;
    this.salary = salary;
    this.department = department;
  }

  public getSalary(): number {
    return this.salary;
  }
}

// 子类
class Manager extends Employee {
  constructor(name: string, salary: number, department: string) {
    super(name, salary, department);
    this.department = department; // 可以访问 protected 成员
  }

  public displayDepartment(): string {
    return this.department;
  }
}

const manager = new Manager("Bob", 5000, "HR");
console.log(manager.displayDepartment()); // 输出: HR
// console.log(manager.salary); // 错误：无法访问私有成员
```

### （三）继承与多态

#### 1. 继承

继承是面向对象编程的核心概念之一，它允许一个类（子类）继承另一个类（父类）的属性和方法。

#### 2. 多态

多态是面向对象编程的核心特性之一，它允许同一个接口有多种不同的实现方式。通过多态，可以在不修改现有代码的情况下，通过继承和方法重写来扩展功能，从而提高代码的可扩展性和可维护性。

```typescript
// 定义一个基类
abstract class Animal {
  constructor(public name: string) {}

  // 定义一个抽象方法
  abstract makeSound(): void;

  // 定义一个普通方法
  displayInfo(): void {
    console.log(`This is a ${this.name}`);
  }
}

// 定义第一个子类
class Dog extends Animal {
  constructor(name: string) {
    super(name);
  }

  // 实现抽象方法
  makeSound(): void {
    console.log(`${this.name} barks.`);
  }
}

// 定义第二个子类
class Cat extends Animal {
  constructor(name: string) {
    super(name);
  }

  // 实现抽象方法
  makeSound(): void {
    console.log(`${this.name} meows.`);
  }
}

// 使用多态
function animalSound(animal: Animal): void {
  animal.makeSound();
  animal.displayInfo();
}

// 创建对象
const dog = new Dog("Rex");
const cat = new Cat("Whiskers");

// 调用多态方法
animalSound(dog); // 输出: Rex barks. This is a Rex
animalSound(cat); // 输出: Whiskers meows. This is a Whiskers
```

### （四）抽象类与接口

#### 1. 抽象类

抽象类是一种特殊的类，不能直接实例化，只能作为基类被其他类继承。抽象类通常用于定义一个通用的接口或行为，具体的实现由子类完成。抽象类中可以包含抽象方法（仅声明，不实现）和非抽象方法（有具体实现）。

```typescript
abstract class Shape {
  constructor(public name: string) {}

  // 抽象方法
  abstract calculateArea(): number;

  // 非抽象方法
  display(): void {
    console.log(`This is a ${this.name} shape.`);
  }
}

class Circle extends Shape {
  constructor(public radius: number) {
    super("Circle");
  }

  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(public width: number, public height: number) {
    super("Rectangle");
  }

  calculateArea(): number {
    return this.width * this.height;
  }
}

const circle = new Circle(5);
console.log(`${circle.name} area: ${circle.calculateArea()}`); // 输出: Circle area: 78.53981633974483
circle.display(); // 输出: This is a Circle shape.

const rectangle = new Rectangle(4, 6);
console.log(`${rectangle.name} area: ${rectangle.calculateArea()}`); // 输出: Rectangle area: 24
rectangle.display(); // 输出: This is a Rectangle shape.
```

#### 2. 接口

接口用于定义对象的结构，可以包含方法签名、属性等。与抽象类不同，接口不能包含方法的实现，只能用于描述类型。

```typescript
interface Drawable {
  draw(): void;
}

class Canvas implements Drawable {
  draw() {
    console.log("Drawing on canvas...");
  }
}

class Printer implements Drawable {
  draw() {
    console.log("Printing...");
  }
}

function drawShape(shape: Drawable) {
  shape.draw();
}

const canvas = new Canvas();
const printer = new Printer();

drawShape(canvas); // 输出: Drawing on canvas...
drawShape(printer); // 输出: Printing...
```

### （五）静态成员与内部方法

#### 1. 静态成员

静态成员属于类本身，而不是类的实例。可以使用 static 关键字来定义静态属性和静态方法。

```typescript
class MathUtils {
  static PI: number = 3.1416;

  static calculateCircleArea(radius: number): number {
    return MathUtils.PI * radius * radius;
  }
}

console.log(MathUtils.PI); // 输出: 3.1416
console.log(MathUtils.calculateCircleArea(5)); // 输出: 78.54
```

#### 2. 内部方法

在类中，有时需要定义一些辅助方法，这些方法仅供类内部使用，不对外暴露。可以通过将方法定义为 private 来实现。

```typescript
class StringProcessor {
  private sanitize(input: string): string {
    return input.trim().replace(/[^a-zA-Z0-9]/g, "");
  }

  public process(input: string): string {
    const sanitized = this.sanitize(input);
    return sanitized.toUpperCase();
  }
}

const processor = new StringProcessor();
console.log(processor.process("  Hello, World!  ")); // 输出: HELLOWORLD
```

## 三、泛型高级用法

### （一）泛型的定义与意义

泛型是 TypeScript 中的一种强大特性，它允许我们在定义函数、类或接口时，不指定具体的类型，而是在使用时再确定类型。这种机制提供了类型重用、类型安全性和灵活性，使得代码更加通用和可维护。

通过使用泛型，我们可以编写能够处理多种类型数据的函数和类，同时保持严格的类型检查。这不仅提高了代码的复用性，还确保了类型的安全性，避免了不必要的类型错误。

### （二）泛型的高级应用

#### 1. 泛型函数

泛型函数允许我们为函数的类型参数传递一个或多个类型参数。这些类型参数可以用于函数参数、函数返回值或函数体中的其他任何位置。

```typescript
function identity<T>(arg: T): T {
    return arg;
}

let output1 = identity<string>("myString");  // 明确指定T为string类型
let output2 = identity(5);  // 编译器自动推断T为number类型
```

#### 2. 泛型接口

在定义接口时，可以使用泛型来创建可重用的组件。这通常用于创建可重用的数据结构，如数组、队列、栈等。

```typescript
interface GenericIdentityFn<T> {
    (arg: T): T;
}

function identity<T>(arg: T): T {
    return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
let output = myIdentity(5);  // 输出5，且类型是number
```

#### 3. 泛型类

在 TypeScript 中，可以创建泛型类。泛型类中的泛型类型可以用于类的属性、方法或构造函数。

```typescript
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = (x, y) => x + y;
let result = myGenericNumber.add(5, 10);  // 输出15，且类型是number
```

#### 4. 泛型约束

泛型约束使我们可以限制类型参数必须具有特定属性或结构，提高类型安全性。

```typescript
interface Lengthwise {
    length: number;
}

// 泛型约束：T 必须符合 Lengthwise 接口
function getLength<T extends Lengthwise>(arg: T): number {
    return arg.length; // 安全，因为我们保证 T 有 length 属性
}

getLength("Hello"); // 字符串有 length 属性，可以正常工作
getLength([1, 2, 3]); // 数组有 length 属性，可以正常工作
// getLength(123); // 错误！数字没有 length 属性
```

#### 5. 泛型与工具类型

在 TypeScript 中，工具类型是泛型的高级应用，它们可以帮助我们更灵活地处理类型。以下是一个使用 `Partial<T>` 的案例：

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age?: number;
}

type PartialUser = Partial<User>;
// PartialUser 类型为：
// {
//   id?: number | undefined;
//   name?: string | undefined;
//   email?: string | undefined;
//   age?: number | undefined;
// }
```

**使用场景**：在需要更新对象的部分属性时非常有用，例如在表单提交或数据更新场景中。

```typescript
const user: User = {
    id: 1,
    name: "Alice",
    email: "alice@example.com"
};

const userUpdate: PartialUser = {
    name: "Alice Smith",
    age: 30
};

// 合并对象
const updatedUser = { ...user, ...userUpdate };
```

#### 6. 泛型与类型保护

泛型还可以与类型保护结合使用，以确保类型安全。以下是一个使用类型保护的泛型函数案例：

```typescript
function processItem<T>(item: T) {
    if (typeof item === "number") {
        console.log(`Number: ${item}`);
    } else if (typeof item === "string") {
        console.log(`String: ${item}`);
    }
}

processItem(42); // 输出: Number: 42
processItem("Hello"); // 输出: String: Hello
```

#### 7. 泛型与高级类型

泛型可以与高级类型（如联合类型、交叉类型、映射类型等）结合使用，以实现更复杂的类型逻辑。以下是一个使用联合类型和泛型的案例：

```typescript
type Message = {
    type: "info";
    message: string;
} | {
    type: "error";
    message: string;
    code: number;
};

function handleMessage<T extends Message>(msg: T) {
    if (msg.type === "info") {
        console.log(`Info: ${msg.message}`);
    } else {
        console.log(`Error [${msg.code}]: ${msg.message}`);
    }
}

handleMessage({ type: "info", message: "All good!" });
handleMessage({ type: "error", message: "Something wrong", code: 404 });
```

### （三）泛型的高级技巧

#### 1. 默认泛型参数

TypeScript 允许为泛型参数提供默认值。这使得在调用泛型函数或类时，如果不指定泛型参数，TypeScript 会自动使用默认值。

```typescript
function logValue<T = string>(value: T): void {
    console.log(value);
}

logValue("Hello"); // 使用默认类型 string
logValue(42); // 显式指定类型 number
```

#### 2. 条件类型

条件类型是 TypeScript 中的一种高级类型，它允许我们根据条件动态地选择类型。

```typescript
type IsNumber<T> = T extends number ? "Yes" : "No";

type A = IsNumber<number>;  // "Yes"
type B = IsNumber<string>;  // "No"
```

#### 3. 泛型与递归类型

递归类型是指类型定义中引用了自身。这在处理嵌套数据结构时非常有用。

```typescript
type Tree<T> = {
    value: T;
    children?: Tree<T>[];
};

const tree: Tree<number> = {
    value: 1,
    children: [
        { value: 2 },
        { value: 3, children: [{ value: 4 }] }
    ]
};
```

### （四）泛型的实际应用

#### 1. 泛型与工具类型结合

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age?: number;
}

// 使用 Omit<T, K> 排除特定属性
type UserWithoutEmail = Omit<User, "email">;

const user: UserWithoutEmail = {
    id: 1,
    name: "Alice",
    age: 30
};
```

#### 2. 泛型在 Redux Toolkit 中的应用

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

// 使用 createAsyncThunk 泛型
export const fetchTodos = createAsyncThunk<Todo[], void>(
    'todos/fetchTodos',
    async () => {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10');
        return await response.json();
    }
);

// 使用 createSlice 泛型
const todosSlice = createSlice({
    name: 'todos',
    initialState: { items: [] } as { items: Todo[] },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchTodos.fulfilled, (state, action) => {
            state.items = action.payload;
        });
    }
});
```

### （五）总结

泛型是 TypeScript 中的一个强大工具，它可以使得代码更加灵活、类型安全并且可重用。通过泛型，函数、类、接口等结构可以处理不同类型的数据，而不牺牲类型检查的安全性。常见的应用场景包括：

- 通用的数据结构或容器类，如数组、列表等。
- 高度可重用的函数和 API 请求处理。
- 通过类型约束限制泛型的使用，使得代码既灵活又安全。

通过实际项目中的应用示例，我们可以看到泛型在项目中的重要性，它使得代码更加模块化、可扩展，并且减少了重复代码的编写。希望这些例子和讲解能帮助你深入理解 TypeScript 中的泛型及其应用场景！

## 四、联合类型与类型守卫

### （一）联合类型的定义与意义

联合类型是 TypeScript 中的一种强大特性，它允许一个变量可以是多种类型中的一种。这意味着在定义变量时，我们可以指定它可能具有的多种类型，而不是单一的类型。这种灵活性在处理复杂数据结构或不确定数据类型时非常有用。

通过联合类型，我们可以在一个变量中存储不同类型的值，同时利用 TypeScript 的类型检查来确保代码的安全性和可维护性。联合类型不仅提高了代码的灵活性，还使得类型注解更加贴近实际应用场景。

### （二）类型守卫的定义与意义

类型守卫是 TypeScript 中用于在运行时确定变量实际类型的一种机制。通过类型守卫，我们可以在代码中对联合类型的变量进行类型检查，从而在不同的类型分支中执行相应的逻辑。这确保了在处理不同类型的值时，代码能够正确地识别并操作这些值。

类型守卫的引入解决了在联合类型中无法直接访问特定类型属性的问题。通过类型守卫，我们可以在确保类型安全的前提下，对不同类型的值进行精确的操作。

### （三）联合类型与类型守卫的高级应用

#### 1. 使用 `typeof` 进行类型守卫

`typeof` 是 JavaScript 中的一个运算符，用于返回变量的类型。在 TypeScript 中，`typeof` 可以作为类型守卫，用于检查变量是否为特定的原始类型，如 `string`、`number`、`boolean` 等。

```typescript
function getLength(input: string | number): number {
  if (typeof input === "string") {
    return input.length;
  } else {
    return input.toString().length;
  }
}

console.log(getLength("TypeScript")); // 输出: 10
console.log(getLength(12345)); // 输出: 5
```

在这个示例中，我们使用 `typeof` 来检查 `input` 是 `string` 类型还是 `number` 类型，并根据不同的类型执行不同的逻辑。

#### 2. 使用 `instanceof` 进行类型守卫

`instanceof` 运算符用于检查一个对象是否是某个构造函数的实例。在 TypeScript 中，`instanceof` 可以作为类型守卫，用于检查对象是否属于特定的类实例。

```typescript
class Animal {
  constructor(public name: string) {}
}

class Dog extends Animal {
  bark() {
    console.log("Woof!");
  }
}

class Cat extends Animal {
  meow() {
    console.log("Meow!");
  }
}

function makeSound(animal: Animal): void {
  if (animal instanceof Dog) {
    animal.bark();
  } else if (animal instanceof Cat) {
    animal.meow();
  }
}

const dog = new Dog("Rex");
const cat = new Cat("Whiskers");

makeSound(dog); // 输出: Woof!
makeSound(cat); // 输出: Meow!
```

在这个示例中，我们使用 `instanceof` 来检查 `animal` 是 `Dog` 类型还是 `Cat` 类型，并根据不同的类型调用相应的方法。

#### 3. 自定义类型守卫函数

除了使用 `typeof` 和 `instanceof`，我们还可以定义自己的类型守卫函数。自定义类型守卫函数通过返回一个类型谓词（`parameterName is Type`）来告诉 TypeScript 变量的类型。

```typescript
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function isBird(animal: Bird | Fish): animal is Bird {
  return (animal as Bird).fly !== undefined;
}

function getEggs(animal: Bird | Fish): void {
  if (isBird(animal)) {
    animal.layEggs();
    animal.fly();
  } else {
    animal.layEggs();
    animal.swim();
  }
}

const bird: Bird = { fly: () => {}, layEggs: () => {} };
const fish: Fish = { swim: () => {}, layEggs: () => {} };

getEggs(bird); // 调用 bird 的方法
getEggs(fish); // 调用 fish 的方法
```

在这个示例中，我们定义了一个自定义类型守卫函数 `isBird`，用于检查 `animal` 是否具有 `Bird` 类型的特征。在 `getEggs` 函数中，我们使用这个类型守卫来决定调用哪些方法。

#### 4. 使用联合类型与类型守卫处理复杂数据结构

联合类型与类型守卫在处理复杂数据结构时非常有用，特别是在处理来自 API 的响应数据或用户输入时。以下是一个处理 API 响应的示例：

```typescript
interface SuccessResponse {
  success: true;
  data: string;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

function handleResponse(response: ApiResponse): void {
  if (response.success) {
    console.log("Data received:", response.data);
  } else {
    console.error("Error:", response.error);
  }
}

const successResponse: SuccessResponse = { success: true, data: "Hello, TypeScript!" };
const errorResponse: ErrorResponse = { success: false, error: "An error occurred" };

handleResponse(successResponse); // 输出: Data received: Hello, TypeScript!
handleResponse(errorResponse); // 输出: Error: An error occurred
```

在这个示例中，我们定义了两个接口 `SuccessResponse` 和 `ErrorResponse`，它们共同构成了联合类型 `ApiResponse`。通过类型守卫 `response.success`，我们可以在处理 API 响应时正确地识别和处理不同的响应类型。

### （四）联合类型与类型守卫的高级技巧

#### 1. 联合类型的类型推断

在某些情况下，TypeScript 可以自动推断联合类型的值。这在函数返回值或变量赋值时特别有用。

```typescript
function getNumberOrString(value: number): number | string {
  if (value > 10) {
    return "Greater than 10";
  } else {
    return value;
  }
}

let result = getNumberOrString(5); // 类型推断为 number | string
console.log(result); // 输出: 5

result = getNumberOrString(15); // 类型推断为 number | string
console.log(result); // 输出: Greater than 10
```

在这个示例中，函数 `getNumberOrString` 根据输入值返回不同类型的结果。TypeScript 能够自动推断出返回值的联合类型。

#### 2. 联合类型与泛型结合

联合类型可以与泛型结合使用，以创建更灵活的函数和类。

```typescript
function combine<T, U>(a: T, b: U): T | U {
  return a || b;
}

let result = combine(5, "hello");
console.log(result); // 输出: "hello"

result = combine("hello", 5);
console.log(result); // 输出: "hello"
```

在这个示例中，我们定义了一个泛型函数 `combine`，它接受两个参数并返回它们的联合类型。这使得函数能够处理多种类型的输入。

### （五）总结

联合类型与类型守卫是 TypeScript 中非常重要的特性，它们提供了处理多种类型数据的灵活性，同时确保了类型的安全性。通过使用联合类型与类型守卫，我们可以在复杂的场景下编写出既安全又灵活的代码。常见的应用场景包括：

- 处理来自 API 的不同类型的响应数据。
- 在用户输入或配置文件中处理多种类型的数据。
- 在复杂的数据结构中进行类型检查和操作。

通过实际项目中的应用示例，我们可以看到联合类型与类型守卫在项目中的重要性，它们使得代码更加模块化、可扩展，并且减少了重复代码的编写。希望这些例子和讲解能帮助你深入理解 TypeScript 中的联合类型与类型守卫及其应用场景！

## 五、TypeScript 的内置工具类型

TypeScript 提供了一系列内置的工具类型，这些工具类型可以帮助开发者更方便地进行类型操作，提高代码的可读性和可维护性。

### （一）Partial\<T>

`Partial<T>` 将类型 `T` 的所有属性变为可选。

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

type PartialUser = Partial<User>;
// PartialUser 类型为：
// {
//   id?: number | undefined;
//   name?: string | undefined;
//   email?: string | undefined;
//   age?: number | undefined;
// }
```

**使用场景**：在需要更新对象的部分属性时非常有用，例如在表单提交或数据更新场景中。

```typescript
const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

const userUpdate: PartialUser = {
  name: "Alice Smith",
  age: 30
};

// 合并对象
const updatedUser = { ...user, ...userUpdate };
```

### （二）Required\<T>

`Required<T>` 将类型 `T` 的所有属性变为必选。

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

type RequiredUser = Required<User>;
// RequiredUser 类型为：
// {
//   id: number;
//   name: string;
//   email: string;
//   age: number;
// }
```

**使用场景**：在需要确保某个类型的属性全部存在时使用，例如在数据验证或完整对象初始化时。

```typescript
const user: RequiredUser = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  age: 30
};
```

### （三）Readonly\<T>

`Readonly<T>` 将类型 `T` 的所有属性变为只读。

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

type ReadonlyUser = Readonly<User>;
// ReadonlyUser 类型为：
// {
//   readonly id: number;
//   readonly name: string;
//   readonly email: string;
//   readonly age?: number | undefined;
// }
```

**使用场景**：在需要防止对象属性被修改时使用，例如在不可变数据结构或只读配置中。

```typescript
const user: ReadonlyUser = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

// user.name = "Bob"; // 错误：不能给只读属性赋值
```

### （四）Pick<T, K>

`Pick<T, K>` 从类型 `T` 中选择部分属性 `K`。

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

type UserPick = Pick<User, 'id' | 'name'>;
// UserPick 类型为：
// {
//   id: number;
//   name: string;
// }
```

**使用场景**：在需要从一个复杂类型中提取部分属性时使用，例如在数据传输或子集操作中。

```typescript
const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

const userPick: UserPick = {
  id: user.id,
  name: user.name
};
```

### （五）Omit<T, K>

`Omit<T, K>` 从类型 `T` 中排除属性 `K`。

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

type UserOmit = Omit<User, 'email'>;
// UserOmit 类型为：
// {
//   id: number;
//   name: string;
//   age?: number | undefined;
// }
```

**使用场景**：在需要从一个类型中排除某些属性时使用，例如在数据过滤或简化类型时。

```typescript
const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

const userOmit: UserOmit = {
  id: user.id,
  name: user.name
};
```

### （六）Record<K, T>

`Record<K, T>` 创建一个对象类型，其键为 `K`，值为 `T`。

```typescript
type UserRecord = Record<'address' | 'phone', string>;
// UserRecord 类型为：
// {
//   address: string;
//   phone: string;
// }
```

**使用场景**：在需要创建一个具有特定键和值类型的对象时使用，例如在配置对象或映射表中。

```typescript
const userRecord: UserRecord = {
  address: "123 Main St",
  phone: "555-1234"
};
```

## 六、装饰器

装饰器是 TypeScript 中一种实验性特性，用于在类、方法、属性和参数上添加元数据和行为。装饰器通过在代码中添加注解的方式，使得代码更加简洁和易于维护。

### （一）类装饰器

类装饰器用于装饰类，可以访问和修改类的构造函数。

```typescript
function logClass(target: Function) {
  console.log(`Logging class: ${target.name}`);
}

@logClass
class MyClass {}
```

### （二）方法装饰器

方法装饰器用于装饰方法，可以访问和修改方法的属性描述符。

```typescript
function logMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function(...args: any[]) {
    console.log(`Calling method: ${propertyKey} with args: ${args}`);
    return originalMethod.apply(this, args);
  };
}

class MyClass {
  @logMethod
  greet(name: string) {
    console.log(`Hello, ${name}!`);
  }
}

const obj = new MyClass();
obj.greet("Alice"); // 输出: Calling method: greet with args: Alice, Hello, Alice!
```

### （三）属性装饰器

属性装饰器用于装饰属性，可以访问和修改属性的属性描述符。

```typescript
function logProperty(target: any, propertyKey: string) {
  console.log(`Logging property: ${propertyKey}`);
}

class MyClass {
  @logProperty
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

const obj = new MyClass("Alice");
```

### （四）参数装饰器

参数装饰器用于装饰参数，可以访问和修改参数的属性描述符。

```typescript
function logParameter(target: any, propertyKey: string, parameterIndex: number) {
  console.log(`Logging parameter at index ${parameterIndex} for method ${propertyKey}`);
}

class MyClass {
  greet(@logParameter name: string) {
    console.log(`Hello, ${name}!`);
  }
}

const obj = new MyClass();
obj.greet("Alice");
```

### （五）装饰器的高级应用

#### 1. 装饰器工厂

装饰器工厂允许我们创建可配置的装饰器，通过接受参数来生成装饰器函数。这使得装饰器更加灵活和可重用。

```typescript
function repeat(times: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      for (let i = 0; i < times; i++) {
        originalMethod.apply(this, args);
      }
    };
  };
}

class MyClass {
  @repeat(3)
  greet(name: string) {
    console.log(`Hello, ${name}!`);
  }
}

const obj = new MyClass();
obj.greet("Alice");
// 输出:
// Hello, Alice!
// Hello, Alice!
// Hello, Alice!
```

在这个示例中，我们创建了一个装饰器工厂 `repeat`，它接受一个参数 `times`，表示方法应该被调用的次数。通过使用这个装饰器工厂，我们可以在运行时动态地控制方法的执行次数。

#### 2. 多个装饰器

可以在同一个类、方法、属性或参数上应用多个装饰器。装饰器的执行顺序是从下到上（即后应用的装饰器先执行）。

```typescript
function decorator1(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log("Decorator 1 applied");
}

function decorator2(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log("Decorator 2 applied");
}

class MyClass {
  @decorator1
  @decorator2
  method() {
    console.log("Method called");
  }
}

const obj = new MyClass();
obj.method();
// 输出:
// Decorator 2 applied
// Decorator 1 applied
// Method called
```

在这个示例中，我们为 `method` 方法应用了两个装饰器 `decorator1` 和 `decorator2`。当方法被调用时，装饰器的执行顺序是先执行 `decorator2`，然后执行 `decorator1`，最后才执行方法本身。

#### 3. 装饰器在实际项目中的应用

装饰器在实际项目中有着广泛的应用场景，以下是一些常见的使用案例：

1. **日志记录**：通过装饰器记录类、方法、属性或参数的访问和操作，便于调试和监控应用运行状态。
2. **权限验证**：在方法上应用装饰器，用于验证用户是否具有执行某项操作的权限。
3. **性能监控**：使用装饰器测量方法的执行时间，帮助识别性能瓶颈。
4. **数据验证**：在类的属性上应用装饰器，用于验证数据的格式和范围。
5. **AOP（面向切面编程）**：通过装饰器实现横切关注点，如事务管理、异常处理等。

### （六）总结

装饰器是 TypeScript 中一种强大的特性，可以用于装饰类、方法、属性和参数。通过装饰器，可以在运行时动态地添加功能和修改行为，使得代码更加灵活和可维护。在实际项目中，合理使用装饰器可以显著提高开发效率和代码质量。

## 七、type 和 interface 的异同和使用场景

`type` 和 `interface` 都可以用来定义类型，包括对象的形状、函数的类型等。它们的主要区别在于：

1. **扩展性**：
   - `interface` 支持多次声明，可以合并多个接口定义。
   - `type` 不支持多次声明，但可以通过交叉类型来扩展。

2. **复杂类型**：
   - `type` 可以定义更复杂的类型，如联合类型、元组等。
   - `interface` 主要用于定义对象的形状。

3. **可读性**：
   - `interface` 更适合定义复杂的对象形状，可读性更好。
   - `type` 更适合定义简单的类型或复杂的类型操作。

### （一）使用场景

- 使用 `interface` 定义对象的形状，特别是需要扩展或继承的场景。
- 使用 `type` 定义简单的类型、元组、联合类型或复杂的类型操作。

```typescript
// 使用 interface 定义对象形状
interface User {
  id: number;
  name: string;
  email: string;
}

// 使用 type 定义复杂的类型操作
type PartialUser = Pick<User, 'id' | 'name'>;
```

### （二）详细对比与使用指南

#### 1. 基本定义与语法

- **`interface`**：
  - 主要用于定义对象的结构（属性和方法）。
  - 支持声明合并（多次声明同一接口会自动合并）。
  - 通过 `extends` 实现继承。

```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: string;
}
```

- **`type`**：
  - 可以为任何类型（包括原始类型、联合类型、交叉类型等）定义别名。
  - 不支持声明合并。
  - 通过 `&` 实现交叉类型扩展。

```typescript
type Age = number;
type Person = {
  name: string;
  age: Age;
};

type Employee = Person & {
  employeeId: string;
};
```

#### 2. 扩展性

- **`interface`**：
  - 使用 `extends` 关键字扩展其他 `interface`。
  - 支持多重继承。

```typescript
interface Shape {
  name: string;
}

interface Circle extends Shape {
  radius: number;
}

interface Sphere extends Circle {
  volume: number;
}
```

- **`type`**：
  - 使用交叉类型（`&`）进行扩展。
  - 不支持多重继承，但可以通过交叉类型实现类似效果。

```typescript
type Shape = {
  name: string;
};

type Circle = Shape & {
  radius: number;
};

type Sphere = Circle & {
  volume: number;
};
```

#### 3. 复杂类型定义

- **`type`**：
  - 可以定义联合类型、元组类型、原始类型等。
  - 支持条件类型和映射类型。

```typescript
type ID = string | number;
type Coordinates = [number, number];
type Callback = (data: string) => void;
type Nullable<T> = T | null;
type ReadonlyUser = Readonly<User>;
```

- **`interface`**：
  - 只能定义对象类型。
  - 不支持联合类型、元组类型等复杂类型定义。

#### 4. 类的实现

- **`interface`**：
  - 可以被类实现，适用于定义类的结构。

```typescript
interface Animal {
  eat(): void;
}

class Dog implements Animal {
  eat() {
    console.log("Woof!");
  }
}
```

- **`type`**：
  - 不能被类实现。

#### 5. 性能与工具提示

- **`interface`**：
  - 编译器对 `interface` 有更多优化，工具提示更清晰。
- **`type`**：
  - 工具提示可能显示展开后的类型，有时会比较冗长。

### （三）实践指导

1. **优先使用 `interface`**：
   - 定义对象或类的结构时，`interface` 更加清晰明确。
   - 需要声明合并或类实现时，`interface` 更合适。

2. **使用 `type` 的场景**：
   - 定义联合类型、交叉类型或复杂类型操作时，`type` 更灵活。
   - 定义元组、函数类型或使用高级类型工具（如条件类型、映射类型）时，`type` 是唯一选择。

### （四）示例对比

#### 1. 扩展类型

- **`interface`**（使用 `extends`）：

```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}
```

- **`type`**（使用 `&`）：

```typescript
type Animal = {
  name: string;
};

type Dog = Animal & {
  breed: string;
};
```

#### 2. 联合类型

- **`type`**（`interface` 无法直接实现）：

```typescript
type ID = string | number;
```

### （五）总结

| 使用场景 | 推荐使用 |
| --- | --- |
| 定义简单的对象类型 | `interface` |
| 定义类的结构 | `interface` |
| 需要类型合并 | `interface` |
| 定义联合类型或交叉类型 | `type` |
| 定义函数类型或复杂类型表达式 | `type` |

总体来说，`interface` 更适合用于描述对象和类的结构，而 `type` 则提供了更多灵活性，适用于更复杂的类型表达需求。了解这两者的区别和适用场景，可以帮助你更合理地组织代码。

## 八、总结

TypeScript 的高级特性为开发者提供了强大的工具，能够构建出更加健壮、可维护和可扩展的应用程序。通过抽象类、接口、访问修饰符、静态成员和内部方法等特性，可以更好地组织代码结构，实现代码的复用和模块化。在实际项目中，合理运用这些高级特性，能够显著提高开发效率和代码质量。
