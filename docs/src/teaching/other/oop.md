# 面向对象编程（OOP）概述

面向对象编程（Object-Oriented Programming，简称OOP）是一种程序设计范式，通过将数据（属性）和操作数据的方法（行为）封装在对象中来组织代码。OOP的目标是提高代码的重用性、可扩展性和可维护性。

OOP的核心思想是对象，对象是数据和方法的集合，体现了现实世界中的事物（如一个人、一个车等）的属性和行为。

## 一、OOP的基本三要素

面向对象编程的三大核心概念是：封装、继承和多态。

### 1. 封装（Encapsulation）

封装是将数据和操作数据的代码（方法）结合成一个整体（对象），并隐藏对象的内部实现细节，只暴露必要的接口。这能够减少外部对对象内部结构的依赖，提高代码的安全性和可维护性。

示例：

``` typescript
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

在上述代码中，brand, model, year 被封装成私有变量，外部无法直接修改这些变量，只能通过提供的公共方法 getInfo() 和 setYear() 来访问和修改。

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

这里Dog和Cat继承自Animal，并重写了speak()方法，显示不同的输出。

### 3. 多态（Polymorphism）

多态是指对象可以以不同的形式表现出来。通过多态，一个父类引用可以指向不同类型的子类对象，并调用相同的方法，表现出不同的行为。

示例：
``` typescript
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

在这个例子中，animals列表包含了不同类型的动物对象，尽管它们都是Animal类型，但调用speak()时表现出不同的行为（狗、猫和鸟的叫声）。

## 二、OOP的五大基本原则（SOLID原则）

SOLID原则是面向对象设计中帮助开发者编写更清晰、可维护、可扩展代码的五大原则。每个原则都针对不同的设计需求，帮助解决不同的问题。

### 1. 单一职责原则（Single Responsibility Principle，SRP）

一个类应该仅有一个职责，意味着该类只负责一项功能。类的变化应该是由单一功能引起的。

示例：

``` typescript
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

* 在这个示例中，Report类负责报告的生成，ReportPrinter类负责报告的打印。每个类的职责都很清晰，符合单一职责原则。

### 2. 开放封闭原则（Open/Closed Principle，OCP）

软件实体应该对扩展开放，对修改封闭。意味着我们可以通过扩展已有类来增加新功能，而不是修改现有的代码。

示例：

``` typescript
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

* Shape类是开放的，可以通过继承来扩展新的图形类型，而不需要修改现有的代码。

### 3. 里氏替换原则（Liskov Substitution Principle，LSP）

子类对象应该能够替换父类对象而不改变程序的正确性。也就是说，子类必须能够继承父类的行为，且不破坏父类的预期行为。

示例：

``` typescript
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

* 这个例子中，Ostrich类不能替代Bird类，因为鸵鸟不能飞行，违反了里氏替换原则。

### 4. 接口隔离原则（Interface Segregation Principle，ISP）

客户端不应依赖于它不需要的接口。一个类对外暴露的接口应该根据客户需求拆分，不要把所有的功能都堆砌在一个接口中。

示例：
``` typescript
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

* 在这个例子中，Human类实现了Workable和Eatable接口，而Robot类只实现了Workable接口。这样，Robot类没有不需要的方法，符合接口隔离原则。

### 5. 依赖倒置原则（Dependency Inversion Principle，DIP）

高层模块不应依赖低层模块，二者都应依赖于抽象；抽象不应依赖细节，细节应依赖于抽象。

示例：
``` typescript
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

* Application类依赖于Database接口（抽象类），通过依赖注入的方式传入具体的数据库实现，符合依赖倒置原则。

## 三、常用设计模式

设计模式是针对常见软件设计问题的解决方案，旨在提高代码的可复用性、可维护性和可扩展性。

### 1. 单例模式（Singleton Pattern）

单例模式保证一个类只有一个实例，并提供全局访问点。

示例：

``` typescript
class Singleton {
    private static instance: Singleton;

    private constructor() {}

    public static getInstance(): Singleton {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton();
        }
        return Singleton.instance;
    }
}

const singleton1 = Singleton.getInstance();
const singleton2 = Singleton.getInstance();
console.log(singleton1 === singleton2);  // 输出: true
```

### 2. 工厂模式（Factory Pattern）

工厂模式通过定义一个工厂方法来创建对象，而不是直接实例化对象，适用于对象创建过程较为复杂时。

示例：
``` typescript
abstract class Animal {
    abstract speak(): string;
}

class Dog extends Animal {
    speak(): string {
        return "Woof";
    }
}

class Cat extends Animal {
    speak(): string {
        return "Meow";
    }
}

class AnimalFactory {
    static createAnimal(animalType: string): Animal {
        if (animalType === "dog") {
            return new Dog();
        } else if (animalType === "cat") {
            return new Cat();
        }
        throw new Error("Unknown animal type");
    }
}

const animal = AnimalFactory.createAnimal("dog");
console.log(animal.speak());  // 输出: Woof
```

### 3. 观察者模式（Observer Pattern）

观察者模式定义了一种一对多的依赖关系，当一个对象的状态发生变化时，所有依赖于它的对象都会自动更新。

示例：

``` typescript
class Subject {
    private observers: Observer[] = [];

    addObserver(observer: Observer): void {
        this.observers.push(observer);
    }

    notify(): void {
        this.observers.forEach(observer => observer.update());
    }
}

interface Observer {
    update(): void;
}

class ConcreteObserver implements Observer {
    update(): void {
        console.log("State has been updated.");
    }
}

const subject = new Subject();
const observer = new ConcreteObserver();

subject.addObserver(observer);
subject.notify();  // 输出: State has been updated.
```

## 总结

* 面向对象编程（OOP）的三大基本要素是：封装、继承和多态。
* SOLID原则帮助设计更好的面向对象代码，包括：单一职责原则、开放封闭原则、里氏替换原则、接口隔离原则和依赖倒置原则。
* 常见的设计模式包括：单例模式、工厂模式和观察者模式，它们提供了解决特定设计问题的标准方法。
