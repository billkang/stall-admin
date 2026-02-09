# 对象创建方式概括

在 JavaScript 中，有多种方式可以创建对象。每种方式都有其优缺点，适用于不同的场景。以下是几种常见的对象创建方式及其详细说明。

## 1. 工厂模式

通过函数封装创建对象的细节，调用函数复用代码。但创建出的对象无法与特定类型关联，只是简单封装复用代码，未建立对象与类型间关系。

### 优点

- 通过函数封装创建对象的细节，调用函数可复用代码，简单易懂。
- 适合创建少量相似对象。

### 缺点

- 创建出的对象无法与某个特定类型联系起来，只是简单封装了复用代码，没有建立起对象和类型间的关系，不利于对象的识别和管理。

### 示例代码

```javascript
function createPerson(name, age) {
  let obj = new Object();
  obj.name = name;
  obj.age = age;
  obj.sayName = function () {
    console.log(this.name);
  };
  return obj;
}

let person1 = createPerson('张三', 20);
let person2 = createPerson('李四', 25);
```

### 内存分配示意图

```
Initial State:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | createPerson  | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | createPerson -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

When createPerson("张三", 20) is called:
Execution Context for createPerson:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "张三"
| | age           | | -> 20
| | obj           | | -> [object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | arguments -> [activation object] |
| | name -> [activation object] |
| | age -> [activation object] |
| | obj -> [activation object] |
| +------------------|
| This Binding: Global Execution Context's this binding |
| Scope Chain: |
| -> Global Execution Context |
+-------------------+

Object Creation (obj):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "张三"
| | age           | | -> 20
| | sayName       | | -> [function]
| +---------------+ |
+-------------------+

Function Creation (sayName):
+-------------------+
| Code              |
| +---------------+ |
| | console.log(this.name); |
| +---------------+ |
+-------------------+

After returning obj:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | createPerson  | |
| | person1       | | -> [person1 object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | createPerson -> [variable object] |
| | person1 -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Similar process for createPerson("李四", 25):
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | createPerson  | |
| | person1       | | -> [person1 object]
| | person2       | | -> [person2 object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | createPerson -> [variable object] |
| | person1 -> [variable object] |
| | person2 -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+
```

### 详细解释

- **Initial State**: 仅包含 `createPerson` 函数。
- **Calling `createPerson("张三", 20)`**: 创建一个新的执行上下文，初始化 `name` 和 `age`，并创建一个新对象 `obj`。
- **Object Creation**: `obj` 包含 `name`, `age`, 和 `sayName` 方法。
- **Function Creation**: `sayName` 是一个独立的函数对象。
- **Returning `obj`**: 将 `obj` 赋值给 `person1`。
- **Similar Process**: 对于 `createPerson("李四", 25)`，重复上述过程，创建新的对象 `person2`。

## 2. 构造函数模式

JavaScript 中每个函数都可以作为构造函数使用，通过 `new` 关键字调用。执行时先创建对象，将对象原型指向构造函数的 `prototype` 属性，`this` 指向新对象，再执行函数体。如果返回值不是对象，则返回新建对象。

### 优点

- 所创建的对象和构造函数建立了联系，可以通过原型来识别对象的类型，为对象的识别和管理提供了便利。
- 适合创建大量相似对象且需要明确对象类型的情况。

### 缺点

- 每个实例都会创建一个新的函数对象（如 `sayName`），浪费内存。
- 函数是所有实例通用的，不利于代码的复用和内存的优化。

### 示例代码

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.sayName = function () {
    console.log(this.name);
  };
}

let person1 = new Person('张三', 20);
let person2 = new Person('李四', 25);
```

### 内存分配示意图

```
Initial State:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

When new Person("张三", 20) is called:
Constructor Call Execution Context:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "张三"
| | age           | | -> 20
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | arguments -> [activation object] |
| | name -> [activation object] |
| | age -> [activation object] |
| +------------------|
| This Binding: New Instance |
| Scope Chain: |
| -> Constructor Call Execution Context |
| -> Global Execution Context |
+-------------------+

New Instance (person1):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "张三"
| | age           | | -> 20
| | sayName       | | -> [function]
| +---------------+ |
+-------------------+

Function Creation (sayName):
+-------------------+
| Code              |
| +---------------+ |
| | console.log(this.name); |
| +---------------+ |
+-------------------+

After returning new instance:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| | person1       | | -> [person1 object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| | person1 -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Similar process for new Person("李四", 25):
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| | person1       | | -> [person1 object]
| | person2       | | -> [person2 object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| | person1 -> [variable object] |
| | person2 -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+
```

### 详细解释

- **Initial State**: 仅包含 `Person` 构造函数。
- **Constructor Call**: 使用 `new` 关键字调用 `Person`，创建一个新的执行上下文，初始化 `name` 和 `age`，并将 `this` 绑定到新创建的对象。
- **New Instance**: 新创建的对象包含 `name`, `age`, 和 `sayName` 方法。
- **Function Creation**: `sayName` 是一个独立的函数对象。
- **Returning New Instance**: 将新对象赋值给 `person1`。
- **Similar Process**: 对于 `new Person("李四", 25)`，重复上述过程，创建新的对象 `person2`。

## 3. 原型模式

每个函数都有一个 `prototype` 属性，是一个对象，包含通过构造函数创建的所有实例共享的属性和方法。通过原型对象添加公用属性和方法实现代码复用，解决构造函数模式中函数对象复用问题。但无法通过传参初始化值，且引用类型值如数组等，所有实例共享，一实例改变影响所有实例。

### 优点

- 可以使用原型对象来添加公用属性和方法，从而实现代码的复用，解决了构造函数模式中函数对象无法复用的问题，提高了内存的利用效率。
- 适合创建大量相似对象且需要共享方法的情况。

### 缺点

- 没有办法通过传入参数来初始化值，灵活性较差。
- 如果存在一个引用类型如数组这样的值，那么所有的实例将共享一个对象，一个实例对引用类型值的改变会影响所有的实例，可能会导致数据的错误共享和修改，存在一定的安全隐患。

### 示例代码

```javascript
function Person() {}
Person.prototype.name = '张三';
Person.prototype.age = 20;
Person.prototype.sayName = function () {
  console.log(this.name);
};

let person1 = new Person();
let person2 = new Person();
```

### 内存分配示意图

```
Initial State:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Prototype Initialization:
Person Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | constructor   | | -> Person
| | name          | | -> "张三"
| | age           | | -> 20
| | sayName       | | -> [function]
| +---------------+ |
+-------------------+

Function Creation (sayName):
+-------------------+
| Code              |
| +---------------+ |
| | console.log(this.name); |
| +---------------+ |
+-------------------+

When new Person() is called:
Constructor Call Execution Context:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | arguments -> [activation object] |
| +------------------|
| This Binding: New Instance |
| Scope Chain: |
| -> Constructor Call Execution Context |
| -> Global Execution Context |
+-------------------+

New Instance (person1):
+-------------------+
| Properties        |
| +---------------+ |
| | __proto__     | | -> Person.prototype
| +---------------+ |
+-------------------+

After returning new instance:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| | person1       | | -> [person1 object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| | person1 -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Similar process for new Person():
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| | person1       | | -> [person1 object]
| | person2       | | -> [person2 object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| | person1 -> [variable object] |
| | person2 -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+
```

### 详细解释

- **Initial State**: 仅包含 `Person` 构造函数。
- **Prototype Initialization**: 初始化 `Person.prototype`，添加 `name`, `age`, 和 `sayName` 方法。
- **Constructor Call**: 使用 `new` 关键字调用 `Person`，创建一个新的执行上下文，`this` 绑定到新创建的对象。
- **New Instance**: 新创建的对象只有一个 `__proto__` 属性，指向 `Person.prototype`。
- **Returning New Instance**: 将新对象赋值给 `person1`。
- **Similar Process**: 对于 `new Person()`，重复上述过程，创建新的对象 `person2`。

## 4. 组合使用构造函数模式和原型模式

这是创建自定义类型最常见的方法。分开使用两种模式有各自的缺点，组合使用可以解决这些问题。通过构造函数初始化对象属性，通过原型对象实现函数方法的复用。

### 优点

- 综合了构造函数模式和原型模式的优点，通过构造函数来初始化对象的属性，通过原型对象来实现函数方法的复用。
- 解决了构造函数模式中函数对象无法复用的问题，又解决了原型模式无法通过传入参数初始化值的问题。
- 是创建自定义类型的最常见且较为理想的方式，能够较好地满足多种开发需求。

### 缺点

- 因为使用了两种不同的模式，所以对于代码的封装性不够好，代码结构相对复杂一些，初学者可能需要花费一些时间去理解和掌握。
- 在维护和扩展时也需要同时考虑两种模式的兼容性。

### 示例代码

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.sayName = function () {
  console.log(this.name);
};

let person1 = new Person('张三', 20);
let person2 = new Person('李四', 25);
```

### 内存分配示意图

```
Initial State:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Prototype Initialization:
Person Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | constructor   | | -> Person
| | sayName       | | -> [function]
| +---------------+ |
+-------------------+

Function Creation (sayName):
+-------------------+
| Code              |
| +---------------+ |
| | console.log(this.name); |
| +---------------+ |
+-------------------+

When new Person("张三", 20) is called:
Constructor Call Execution Context:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "张三"
| | age           | | -> 20
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | arguments -> [activation object] |
| | name -> [activation object] |
| | age -> [activation object] |
| +------------------|
| This Binding: New Instance |
| Scope Chain: |
| -> Constructor Call Execution Context |
| -> Global Execution Context |
+-------------------+

New Instance (person1):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "张三"
| | age           | | -> 20
| | __proto__     | | -> Person.prototype
| +---------------+ |
+-------------------+

After returning new instance:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| | person1       | | -> [person1 object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| | person1 -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Similar process for new Person("李四", 25):
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| | person1       | | -> [person1 object]
| | person2       | | -> [person2 object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| | person1 -> [variable object] |
| | person2 -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+
```

### 详细解释

- **Initial State**: 仅包含 `Person` 构造函数。
- **Prototype Initialization**: 初始化 `Person.prototype`，添加 `sayName` 方法。
- **Constructor Call**: 使用 `new` 关键字调用 `Person`，创建一个新的执行上下文，初始化 `name` 和 `age`，并将 `this` 绑定到新创建的对象。
- **New Instance**: 新创建的对象包含 `name`, `age`, 和 `__proto__` 属性，指向 `Person.prototype`。
- **Returning New Instance**: 将新对象赋值给 `person1`。
- **Similar Process**: 对于 `new Person("李四", 25)`，重复上述过程，创建新的对象 `person2`。

## 5. 动态原型模式

将原型方法赋值的过程移到构造函数内部，通过判断属性是否存在，实现仅第一次调用函数时对原型对象赋值一次，对混合模式进行了封装。

### 优点

- 将原型方法赋值的创建过程移动到了构造函数的内部，通过对属性是否存在的判断，可以实现仅在第一次调用函数时对原型对象赋值一次的效果。
- 很好地对组合使用构造函数模式和原型模式的混合模式进行了封装，使得代码更加简洁、易于理解和维护。
- 避免了多次对原型对象进行不必要的赋值操作，提高了代码的执行效率。

### 缺点

- 在一定程度上增加了代码的复杂性，对于初学者来说可能不太容易理解其原理和实现方式。
- 如果在构造函数内部对原型对象进行过多的操作，可能会导致构造函数的执行时间变长，影响对象的创建效率。

### 示例代码

```javascript
function Person(name, age) {
  if (typeof Person._initialized === 'undefined') {
    Person.prototype.sayName = function () {
      console.log(this.name);
    };
    Person._initialized = true;
  }
  this.name = name;
  this.age = age;
}

let person1 = new Person('张三', 20);
let person2 = new Person('李四', 25);
```

### 内存分配示意图

```
Initial State:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

When new Person("张三", 20) is called:
Constructor Call Execution Context:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "张三"
| | age           | | -> 20
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | arguments -> [activation object] |
| | name -> [activation object] |
| | age -> [activation object] |
| +------------------|
| This Binding: New Instance |
| Scope Chain: |
| -> Constructor Call Execution Context |
| -> Global Execution Context |
+-------------------+

Prototype Initialization:
Person Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | constructor   | | -> Person
| | sayName       | | -> [function]
| +---------------+ |
+-------------------+

Function Creation (sayName):
+-------------------+
| Code              |
| +---------------+ |
| | console.log(this.name); |
| +---------------+ |
+-------------------+

New Instance (person1):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "张三"
| | age           | | -> 20
| | __proto__     | | -> Person.prototype
| +---------------+ |
+-------------------+

After returning new instance:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| | person1       | | -> [person1 object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| | person1 -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Similar process for new Person("李四", 25):
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| | person1       | | -> [person1 object]
| | person2       | | -> [person2 object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| | person1 -> [variable object] |
| | person2 -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+
```

### 详细解释

- **Initial State**: 仅包含 `Person` 构造函数。
- **First Constructor Call**: 使用 `new` 关键字调用 `Person`，检查 `_initialized` 属性不存在，初始化 `Person.prototype`，添加 `sayName` 方法，并设置 `_initialized` 为 `true`。
- **New Instance**: 新创建的对象包含 `name`, `age`, 和 `__proto__` 属性，指向 `Person.prototype`。
- **Returning New Instance**: 将新对象赋值给 `person1`。
- **Subsequent Calls**: 对于 `new Person("李四", 25)`，跳过原型初始化，直接创建新对象 `person2`。

## 6. 寄生构造函数模式

类似于工厂模式，基于已有类型，在实例化时对实例化对象扩展。不改原构造函数，达到扩展对象的目的。

### 优点

- 主要是基于一个已有的类型，在实例化时对实例化的对象进行扩展。
- 这样既不用修改原来的构造函数，也达到了扩展对象的目的。
- 可以在不改变原有构造函数的基础上，灵活地为对象添加新的属性和方法，具有一定的灵活性和扩展性。
- 适用于对已有类型进行小范围的定制和扩展的场景。

### 缺点

- 和工厂模式一样，无法实现对象的识别，因为通过这种方式创建的对象无法与某个特定的类型关联起来，不利于对象的管理和维护。
- 由于它没有充分利用原型链的特性，所以无法实现方法的复用，每次创建对象时都需要重新创建方法，可能会导致内存的浪费。

### 示例代码

```javascript
function Person(name, age) {
  let obj = new Object();
  obj.name = name;
  obj.age = age;
  obj.sayName = function () {
    console.log(this.name);
  };
  return obj;
}

let person1 = new Person('张三', 20);
let person2 = new Person('李四', 25);
```

### 内存分配示意图

```
Initial State:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

When new Person("张三", 20) is called:
Constructor Call Execution Context:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "张三"
| | age           | | -> 20
| | obj           | | -> [object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | arguments -> [activation object] |
| | name -> [activation object] |
| | age -> [activation object] |
| | obj -> [activation object] |
| +------------------|
| This Binding: Global Execution Context's this binding |
| Scope Chain: |
| -> Global Execution Context |
+-------------------+

Object Creation (obj):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "张三"
| | age           | | -> 20
| | sayName       | | -> [function]
| +---------------+ |
+-------------------+

Function Creation (sayName):
+-------------------+
| Code              |
| +---------------+ |
| | console.log(this.name); |
| +---------------+ |
+-------------------+

After returning obj:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| | person1       | | -> [person1 object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| | person1 -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Similar process for new Person("李四", 25):
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | Person        | |
| | person1       | | -> [person1 object]
| | person2       | | -> [person2 object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | Person -> [variable object] |
| | person1 -> [variable object] |
| | person2 -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+
```

### 详细解释

- **Initial State**: 仅包含 `Person` 构造函数。
- **Constructor Call**: 使用 `new` 关键字调用 `Person`，创建一个新的执行上下文，初始化 `name` 和 `age`，并创建一个新对象 `obj`。
- **Object Creation**: `obj` 包含 `name`, `age`, 和 `sayName` 方法。
- **Function Creation**: `sayName` 是一个独立的函数对象。
- **Returning `obj`**: 将 `obj` 赋值给 `person1`。
- **Similar Process**: 对于 `new Person("李四", 25)`，重复上述过程，创建新的对象 `person2`。

---
