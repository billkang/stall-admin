# 面向对象编程（OOP）概述

面向对象编程（Object-Oriented Programming，简称OOP）是一种程序设计范式，通过将数据（属性）和操作数据的方法（行为）封装在对象中来组织代码。OOP的目标是提高代码的重用性、可扩展性和可维护性。

OOP的核心思想是对象，对象是数据和方法的集合，体现了现实世界中的事物（如一个人、一个车等）的属性和行为。

## 一、OOP的基本三要素

面向对象编程的三大核心概念是：封装、继承和多态。

### 1. 封装（Encapsulation）

封装是将数据和操作数据的代码（方法）结合成一个整体（对象），并隐藏对象的内部实现细节，只暴露必要的接口。这能够减少外部对对象内部结构的依赖，提高代码的安全性和可维护性。

示例：

```typescript
class Car {
    private brand: string;
    private model: string;
    private year: number;

    constructor(brand: string, model: string, year: number) {
        this.brand = brand;
        this.model = model;
        this.year = year;
    }

    public getInfo(): string {
        return `${this.year} ${this.brand} ${this.model}`;
    }

    public setYear(year: number): void {
        if (year > 1900 && year <= 2025) {
            this.year = year;
        } else {
            console.log("Invalid year");
        }
    }
}

const car = new Car("Toyota", "Corolla", 2020);
console.log(car.getInfo());  // 调用公共方法访问私有属性
car.setYear(2023);
```

### 2. 继承（Inheritance）

继承是子类继承父类的属性和方法的能力，子类可以复用父类的代码，同时可以在其基础上扩展功能。继承可以减少代码的冗余，提升代码的复用性。

示例：

```typescript
class Animal {
    protected name: string;

    constructor(name: string) {
        this.name = name;
    }

    speak(): string {
        return '';
    }
}

class Dog extends Animal {
    speak(): string {
        return `${this.name} says Woof!`;
    }
}

class Cat extends Animal {
    speak(): string {
        return `${this.name} says Meow!`;
    }
}

const dog = new Dog("Buddy");
console.log(dog.speak());

const cat = new Cat("Whiskers");
console.log(cat.speak());
```

### 3. 多态（Polymorphism）

多态是指对象可以以不同的形式表现出来。通过多态，一个父类引用可以指向不同类型的子类对象，并调用相同的方法，表现出不同的行为。

示例：
```typescript
class Bird extends Animal {
    speak(): string {
        return `${this.name} says Tweet!`;
    }
}

const animals: Animal[] = [new Dog("Max"), new Cat("Fluffy"), new Bird("Tweety")];

animals.forEach(animal => {
    console.log(animal.speak());  // 各自调用speak()方法，表现不同的行为
});
```

## 二、OOP的五大基本原则（SOLID原则）

SOLID原则是面向对象设计中帮助开发者编写更清晰、可维护、可扩展代码的五大原则。每个原则都针对不同的设计需求，帮助解决不同的问题。

### 1. 单一职责原则（Single Responsibility Principle，SRP）

一个类应该仅有一个职责，意味着该类只负责一项功能。类的变化应该是由单一功能引起的。

示例：

```typescript
class Report {
    generateReport(): void {
        // 负责生成报告内容
    }
}

class ReportPrinter {
    printReport(report: Report): void {
        // 负责打印报告
    }
}
```

* 在这个示例中，`Report` 类负责报告的生成，`ReportPrinter` 类负责报告的打印。每个类的职责都很清晰，符合单一职责原则。

### 2. 开放封闭原则（Open/Closed Principle，OCP）

软件实体应该对扩展开放，对修改封闭。这意味着我们可以通过扩展已有类来增加新功能，而不是修改现有的代码。

示例：

```typescript
abstract class Shape {
    abstract area(): number;
}

class Rectangle extends Shape {
    constructor(private width: number, private height: number) {
        super();
    }

    area(): number {
        return this.width * this.height;
    }
}

class Circle extends Shape {
    constructor(private radius: number) {
        super();
    }

    area(): number {
        return 3.14 * this.radius * this.radius;
    }
}

function printArea(shape: Shape): void {
    console.log(`Area: ${shape.area()}`);
}

const rect = new Rectangle(4, 5);
const circle = new Circle(3);

printArea(rect);
printArea(circle);
```

* `Shape` 类是开放的，可以通过继承来扩展新的图形类型，而不需要修改现有的代码。

### 3. 里氏替换原则（Liskov Substitution Principle，LSP）

子类对象应该能够替换父类对象而不改变程序的正确性。也就是说，子类必须能够继承父类的行为，且不破坏父类的预期行为。

示例：

```typescript
class Bird {
    fly(): string {
        return "Flying";
    }
}

class Ostrich extends Bird {
    fly(): string {
        throw new Error("Ostriches can't fly!");
    }
}

function makeBirdFly(bird: Bird): void {
    console.log(bird.fly());
}

const bird = new Bird();
makeBirdFly(bird); // 正常情况

const ostrich = new Ostrich();
// makeBirdFly(ostrich);  // 错误的替代，破坏了父类预期的行为
```

* 这个例子中，`Ostrich` 类不能替代 `Bird` 类，因为鸵鸟不能飞行，违反了里氏替换原则。

### 4. 接口隔离原则（Interface Segregation Principle，ISP）

客户端不应依赖于它不需要的接口。一个类对外暴露的接口应该根据客户需求拆分，不要把所有的功能都堆砌在一个接口中。

示例：

```typescript
interface Workable {
    work(): void;
}

interface Eatable {
    eat(): void;
}

class Human implements Workable, Eatable {
    work(): void {
        console.log("Human is working");
    }

    eat(): void {
        console.log("Human is eating");
    }
}

class Robot implements Workable {
    work(): void {
        console.log("Robot is working");
    }
}
```

* 在这个例子中，`Human` 类实现了 `Workable` 和 `Eatable` 接口，而 `Robot` 类只实现了 `Workable` 接口。这样，`Robot` 类没有不需要的方法，符合接口隔离原则。

### 5. 依赖倒置原则（Dependency Inversion Principle，DIP）

高层模块不应依赖低层模块，二者都应依赖于抽象；抽象不应依赖细节，细节应依赖于抽象。

示例：

```typescript
interface Database {
    save(): void;
}

class Application {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    run(): void {
        this.db.save();
    }
}

class MySQLDatabase implements Database {
    save(): void {
        console.log("Data saved to MySQL");
    }
}

const db = new MySQLDatabase();
const app = new Application(db);
app.run();
```

* `Application` 类依赖于 `Database` 接口（抽象类），通过依赖注入的方式传入具体的数据库实现，符合依赖倒置原则。

## 三、常用设计模式

设计模式是针对常见软件设计问题的解决方案，旨在提高代码的可复用性、可维护性和可扩展性。

### 1. 单例模式（Singleton Pattern）

确保一个类只有一个实例，并提供全局访问点。

示例：

```typescript
class Singleton {
    private static instance: Singleton;

    private constructor() {}

    public static getInstance(): Singleton {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton();
        }
        return Singleton.instance;
    }

    public doSomething(): void {
        console.log("Doing something...");
    }
}

// 使用单例
const singleton1 = Singleton.getInstance();
const singleton2 = Singleton.getInstance();
console.log(singleton1 === singleton2); // true
singleton1.doSomething(); // Doing something...
```

### 2. 工厂方法模式（Factory Method Pattern）

定义一个创建对象的接口，但让子类决定实例化哪一个类。工厂方法使一个类的实例化延迟到其子类。

示例：

```typescript
abstract class Creator {
    abstract factoryMethod(): Product;

    public someOperation(): string {
        const product = this.factoryMethod();
        return `Creator: The same creator's code has just worked with ${product.operation()}`;
    }
}

abstract class Product {
    abstract operation(): string;
}

class ConcreteCreatorA extends Creator {
    public factoryMethod(): Product {
        return new ConcreteProductA();
    }
}

class ConcreteCreatorB extends Creator {
    public factoryMethod(): Product {
        return new ConcreteProductB();
    }
}

class ConcreteProductA implements Product {
    public operation(): string {
        return "{Result of the ConcreteProductA}";
    }
}

class ConcreteProductB implements Product {
    public operation(): string {
        return "{Result of the ConcreteProductB}";
    }
}

// 使用工厂方法模式
const creatorA = new ConcreteCreatorA();
console.log(creatorA.someOperation());

const creatorB = new ConcreteCreatorB();
console.log(creatorB.someOperation());
```

### 3. 抽象工厂模式（Abstract Factory Pattern）

提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们的具体类。

示例：

```typescript
interface GUIFactory {
    createButton(): Button;
    createCheckbox(): Checkbox;
}

interface Button {
    paint(): void;
}

interface Checkbox {
    paint(): void;
}

class WinFactory implements GUIFactory {
    public createButton(): Button {
        return new WinButton();
    }

    public createCheckbox(): Checkbox {
        return new WinCheckbox();
    }
}

class MacFactory implements GUIFactory {
    public createButton(): Button {
        return new MacButton();
    }

    public createCheckbox(): Checkbox {
        return new MacCheckbox();
    }
}

class WinButton implements Button {
    public paint(): void {
        console.log("I'm a Windows button.");
    }
}

class WinCheckbox implements Checkbox {
    public paint(): void {
        console.log("I'm a Windows checkbox.");
    }
}

class MacButton implements Button {
    public paint(): void {
        console.log("I'm a MacOS button.");
    }
}

class MacCheckbox implements Checkbox {
    public paint(): void {
        console.log("I'm a MacOS checkbox.");
    }
}

// 使用抽象工厂模式
function clientCode(factory: GUIFactory) {
    const button = factory.createButton();
    const checkbox = factory.createCheckbox();

    button.paint();
    checkbox.paint();
}

clientCode(new WinFactory());
clientCode(new MacFactory());
```

### 4. 观察者模式（Observer Pattern）

定义一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知并自动更新。

示例：

```typescript
interface Observer {
    update(subject: Subject): void;
}

interface Subject {
    attach(observer: Observer): void;
    detach(observer: Observer): void;
    notify(): void;
}

class ConcreteSubject implements Subject {
    private state: number = null;
    private observers: Observer[] = [];

    public attach(observer: Observer): void {
        const isExist = this.observers.includes(observer);
        if (isExist) return console.log('Subject: Observer has been attached already.');
        console.log('Subject: Attached an observer.');
        this.observers.push(observer);
    }

    public detach(observer: Observer): void {
        const observerIndex = this.observers.indexOf(observer);
        if (observerIndex === -1) return console.log('Subject: Nonexistent observer.');
        this.observers.splice(observerIndex, 1);
        console.log('Subject: Detached an observer.');
    }

    public notify(): void {
        console.log('Subject: Notifying observers...');
        for (const observer of this.observers) {
            observer.update(this);
        }
    }

    public setState(state: number): void {
        console.log(`Subject: Setting state to ${state}`);
        this.state = state;
        this.notify();
    }

    public getState(): number {
        return this.state;
    }
}

class ConcreteObserver implements Observer {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    public update(subject: Subject): void {
        if (subject instanceof ConcreteSubject) {
            console.log(`ConcreteObserver ${this.name}: Reacted to the event.`);
        }
    }
}

// 使用观察者模式
const subject = new ConcreteSubject();

const observer1 = new ConcreteObserver('Observer 1');
subject.attach(observer1);

const observer2 = new ConcreteObserver('Observer 2');
subject.attach(observer2);

subject.setState(10);
subject.detach(observer1);
subject.setState(20);
```

### 5. 装饰者模式（Decorator Pattern）

动态地给一个对象添加一些额外的职责。就增加功能来说，装饰者模式相比生成子类更为灵活。

示例：

```typescript
interface Component {
    operation(): string;
}

class ConcreteComponent implements Component {
    public operation(): string {
        return "ConcreteComponent";
    }
}

abstract class Decorator implements Component {
    protected component: Component;

    constructor(component: Component) {
        this.component = component;
    }

    public operation(): string {
        return this.component.operation();
    }
}

class ConcreteDecoratorA extends Decorator {
    public operation(): string {
        return `ConcreteDecoratorA(${super.operation()})`;
    }
}

class ConcreteDecoratorB extends Decorator {
    public operation(): string {
        return `ConcreteDecoratorB(${super.operation()})`;
    }
}

// 使用装饰者模式
const simple = new ConcreteComponent();
console.log(`Client: I've got a simple component: ${simple.operation()}`);

const decorator1 = new ConcreteDecoratorA(simple);
console.log(`Client: Now I've got a decorated component: ${decorator1.operation()}`);

const decorator2 = new ConcreteDecoratorB(decorator1);
console.log(`Client: Now I've got an even more decorated component: ${decorator2.operation()}`);
```

### 6. 适配器模式（Adapter Pattern）

将一个类的接口转换成客户希望的另一个接口。适配器模式使得原本由于接口不兼容而不能一起工作的那些类可以一起工作。

示例：

```typescript
interface Target {
    request(): string;
}

class Adaptee {
    public specificRequest(): string {
        return ".eetpadA eht fo roivaheb laicepS";
    }
}

class Adapter implements Target {
    private adaptee: Adaptee;

    constructor(adaptee: Adaptee) {
        this.adaptee = adaptee;
    }

    public request(): string {
        const result = this.adaptee.specificRequest().split('').reverse().join('');
        return `Adapter: (TRANSLATED) ${result}`;
    }
}

// 使用适配器模式
function clientCode(target: Target) {
    console.log(`Client: I am working with the ${target.request()}`);
}

const adaptee = new Adaptee();
console.log(`Adaptee: I am not compatible with the client: ${adaptee.specificRequest()}`);

const adapter = new Adapter(adaptee);
clientCode(adapter);
```

### 7. 策略模式（Strategy Pattern）

定义一系列算法，把它们一个个封装起来，并且使它们可以互相替换。策略模式使得算法可以在不影响客户端的情况下发生变化。

示例：

```typescript
interface Strategy {
    doAlgorithm(data: string[]): string[];
}

class ConcreteStrategyA implements Strategy {
    public doAlgorithm(data: string[]): string[] {
        return data.sort();
    }
}

class ConcreteStrategyB implements Strategy {
    public doAlgorithm(data: string[]): string[] {
        return data.reverse();
    }
}

class Context {
    private strategy: Strategy;

    constructor(strategy: Strategy) {
        this.strategy = strategy;
    }

    public setStrategy(strategy: Strategy): void {
        this.strategy = strategy;
    }

    public doSomeBusinessLogic(): void {
        console.log(`Context: Sorting data using the strategy (not sure how it'll do it)`);
        const result = this.strategy.doAlgorithm(['a', 'e', 'c', 'b', 'd']);
        console.log(result.join(', '));
    }
}

// 使用策略模式
const context = new Context(new ConcreteStrategyA());
context.doSomeBusinessLogic();

console.log();

context.setStrategy(new ConcreteStrategyB());
context.doSomeBusinessLogic();
```

## 总结

* 面向对象编程（OOP）的三大基本要素是：封装、继承和多态。
* SOLID原则帮助设计更好的面向对象代码，包括：单一职责原则、开放封闭原则、里氏替换原则、接口隔离原则和依赖倒置原则。
* 常见的设计模式包括但不限于：单例模式、工厂方法模式、抽象工厂模式、观察者模式、装饰者模式、适配器模式和策略模式，它们提供了解决特定设计问题的标准方法。

这些设计模式为开发者提供了处理常见编程问题的有效方案。通过理解并应用这些模式，我们可以编写出更加模块化、可扩展和易于维护的代码。每种模式都有其独特之处，适用于不同的场景，在实际开发中应该根据具体需求选择最合适的模式。
