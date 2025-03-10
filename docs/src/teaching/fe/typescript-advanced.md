# TypeScript 高级编程：面向对象与高级特性详解

## 一、引言

在上一篇文章中，我们对 TypeScript 进行了基础的介绍，涵盖了其核心概念和基本语法。然而，TypeScript 的强大远不止于此。在本文中，我们将深入探讨 TypeScript 的高级特性，特别是面向对象编程的相关知识，包括抽象类、接口、访问修饰符（private、protected、public）以及静态成员等。通过丰富的代码示例，帮助读者掌握这些高级特性，并能够将其应用到实际项目中。

## 二、面向对象编程基础回顾

在面向对象编程（OOP）中，我们关注的是如何将现实世界中的实体建模为类和对象。TypeScript 完整地支持 OOP 的三大特性：封装、继承和多态。这些特性使得代码更加模块化、可维护和可扩展。

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

继承是面向对象编程的核心概念之一，它允许一个类（子类）继承另一个类（父类）的属性和方法。多态则是指同一个接口可以有多种不同的实现方式。

```typescript
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

class Cat extends Animal {
  meow() {
    console.log(`${this.name} meows.`);
  }
}

const dog = new Dog("Rex");
dog.move(10); // 输出: Rex moved 10 meters.
dog.bark(); // 输出: Rex barks.

const cat = new Cat("Whiskers");
cat.move(5); // 输出: Whiskers moved 5 meters.
cat.meow(); // 输出: Whiskers meows.
```

## 三、高级特性：抽象类与接口

### （一）抽象类

抽象类是一种特殊的类，不能直接实例化，只能作为基类被其他类继承。抽象类通常用于定义一个通用的接口或行为，具体的实现由子类完成。抽象类中可以包含抽象方法（仅声明，不实现）和非抽象方法（有具体实现）。

```typescript
abstract class Shape {
  constructor(public name: string) {}

  // 抽象方法
  abstract calculateArea(): number;

  // 非抽象方法
  display() {
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

### （二）接口

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

## 四、高级特性：静态成员与内部方法

### （一）静态成员

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

### （二）内部方法

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

## 五、高级类型的应用

### （一）泛型高级用法

泛型不仅可以在函数中使用，还可以在类和接口中使用，以实现更灵活的类型控制。

```typescript
class Box<T> {
  constructor(public content: T) {}

  getContent(): T {
    return this.content;
  }
}

const numberBox = new Box<number>(42);
console.log(numberBox.getContent()); // 输出: 42

const stringBox = new Box<string>("TypeScript");
console.log(stringBox.getContent()); // 输出: TypeScript
```

### （二）联合类型与类型守卫

联合类型允许一个变量可以是多种类型中的一种。通过类型守卫，可以在运行时确定变量的实际类型。

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

## 六、实际项目中的应用案例

### （一）构建一个简单的应用系统

```typescript
// 定义接口
interface Employee {
  id: number;
  name: string;
  department: string;
  calculateSalary(): number;
}

// 抽象类
abstract class BaseEmployee implements Employee {
  constructor(
    public id: number,
    public name: string,
    public department: string
  ) {}

  abstract calculateSalary(): number;

  // 非抽象方法
  displayInfo() {
    console.log(`Employee ID: ${this.id}, Name: ${this.name}, Department: ${this.department}`);
  }
}

// 具体实现
class FullTimeEmployee extends BaseEmployee {
  constructor(
    id: number,
    name: string,
    department: string,
    public annualSalary: number
  ) {
    super(id, name, department);
  }

  calculateSalary(): number {
    return this.annualSalary / 12;
  }
}

class PartTimeEmployee extends BaseEmployee {
  constructor(
    id: number,
    name: string,
    department: string,
    public hourlyRate: number,
    public hoursWorked: number
  ) {
    super(id, name, department);
  }

  calculateSalary(): number {
    return this.hourlyRate * this.hoursWorked;
  }
}

// 使用
const employees: Employee[] = [
  new FullTimeEmployee(1, "Alice", "HR", 60000),
  new PartTimeEmployee(2, "Bob", "IT", 30, 160)
];

employees.forEach(employee => {
  (employee as BaseEmployee).displayInfo();
  console.log(`Salary: $${employee.calculateSalary()}\n`);
});

// 输出:
// Employee ID: 1, Name: Alice, Department: HR
// Salary: $5000

// Employee ID: 2, Name: Bob, Department: IT
// Salary: $4800
```

## 七、高级语法：内置工具类和装饰器

### （一）内置工具类

TypeScript 提供了一些内置的工具类型，可以帮助我们更方便地进行类型操作。例如：

- `Partial<T>`：将类型 `T` 的所有属性变为可选。
- `Required<T>`：将类型 `T` 的所有属性变为必选。
- `Readonly<T>`：将类型 `T` 的所有属性变为只读。
- `Pick<T, K>`：从类型 `T` 中选择部分属性 `K`。
- `Omit<T, K>`：从类型 `T` 中排除属性 `K`。
- `Record<K, T>`：创建一个对象类型，其键为 `K`，值为 `T`。

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

type PartialUser = Partial<User>; // { id?: number; name?: string; email?: string; age?: number; }
type RequiredUser = Required<User>; // { id: number; name: string; email: string; age: number; }
type ReadonlyUser = Readonly<User>; // { readonly id: number; readonly name: string; readonly email: string; readonly age?: number; }
type UserPick = Pick<User, 'id' | 'name'>; // { id: number; name: string; }
type UserOmit = Omit<User, 'email'>; // { id: number; name: string; age?: number; }
type UserRecord = Record<'address' | 'phone', string>; // { address: string; phone: string; }
```

### （二）装饰器

装饰器是 TypeScript 中一种实验性特性，用于在类、方法、属性和参数上添加元数据和行为。装饰器通过在代码中添加注解的方式，使得代码更加简洁和易于维护。

```typescript
function logClass(target: Function) {
  console.log(`Logging class: ${target.name}`);
}

@logClass
class MyClass {}

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

## 八、type 和 interface 的异同和使用场景

### （一）相同点

`type` 和 `interface` 都可以用来定义类型，包括对象的形状、函数的类型等。

```typescript
type Point = {
  x: number;
  y: number;
};

interface Point {
  x: number;
  y: number;
}
```

### （二）不同点

1. **扩展性**：
   - `interface` 支持多次声明，可以合并多个接口定义。
   - `type` 不支持多次声明，但可以通过交叉类型来扩展。

```typescript
interface Point {
  x: number;
  y: number;
}

interface Point {
  z: number;
}

// 等价于
interface Point {
  x: number;
  y: number;
  z: number;
}

type Point = {
  x: number;
  y: number;
};

type Point = Point & {
  z: number;
};
```

2. **复杂类型**：
   - `type` 可以定义更复杂的类型，如联合类型、元组等。
   - `interface` 主要用于定义对象的形状。

```typescript
type Point = [number, number]; // 元组类型
type Point = number | string; // 联合类型

interface Point {
  x: number;
  y: number;
}
```

3. **可读性**：
   - `interface` 更适合定义复杂的对象形状，可读性更好。
   - `type` 更适合定义简单的类型或复杂的类型操作。

### （三）使用场景

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

通过合理选择 `type` 和 `interface`，可以更好地组织代码，提高代码的可读性和可维护性。

## 九、总结

TypeScript 的高级特性为开发者提供了强大的工具，能够构建出更加健壮、可维护和可扩展的应用程序。通过抽象类、接口、访问修饰符、静态成员和内部方法等特性，可以更好地组织代码结构，实现代码的复用和模块化。在实际项目中，合理运用这些高级特性，能够显著提高开发效率和代码质量。
