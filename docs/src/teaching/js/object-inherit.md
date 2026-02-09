# 对象继承方式总结

在 JavaScript 中，有多种方式可以实现对象的继承。每种方式都有其优缺点，适用于不同的场景。以下是几种常见的对象继承方式及其详细说明。

## 1. 原型链继承

通过将子类型的原型指向超类型的实例，使得子类型能够访问超类型原型上的方法和属性，从而实现继承。

### 优点

- 实现简单，能够共享超类型的原型中的方法和属性。
- 适合创建大量相似对象且需要共享方法的情况。

### 缺点

- 包含引用类型值的原型属性会被所有实例共享，容易造成修改的混乱。
- 在创建子类型的时候不能向超类型传递参数。

### 示例代码

```javascript
function SuperType() {
  this.colors = ['red', 'blue', 'green'];
}
SuperType.prototype.sayColors = function () {
  console.log(this.colors);
};

function SubType() {}
SubType.prototype = new SuperType();

let instance1 = new SubType();
instance1.colors.push('black');

let instance2 = new SubType();
console.log(instance2.colors); // ["red", "blue", "green", "black"]
```

### 内存分配示意图

```
Initial State:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | SuperType     | |
| | SubType       | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | SuperType -> [variable object] |
| | SubType -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Prototype Initialization:
SuperType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | constructor   | | -> SuperType
| | sayColors     | | -> [function]
| +---------------+ |
+-------------------+

Function Creation (sayColors):
+-------------------+
| Code              |
| +---------------+ |
| | console.log(this.colors); |
| +---------------+ |
+-------------------+

When SubType.prototype = new SuperType() is executed:
Constructor Call Execution Context for SuperType:
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

New Instance (superInstance):
+-------------------+
| Properties        |
| +---------------+ |
| | colors        | | -> ["red", "blue", "green"]
| | __proto__     | | -> SuperType.prototype
| +---------------+ |
+-------------------+

After returning superInstance:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | SuperType     | |
| | SubType       | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | SuperType -> [variable object] |
| | SubType -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Setting SubType.prototype to superInstance:
SubType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | colors        | | -> ["red", "blue", "green"]
| | __proto__     | | -> SuperType.prototype
| +---------------+ |
+-------------------+

Creating instance1 using new SubType():
Constructor Call Execution Context for SubType:
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

New Instance (instance1):
+-------------------+
| Properties        |
| +---------------+ |
| | __proto__     | | -> SubType.prototype
| +---------------+ |
+-------------------+

Modifying instance1.colors:
SubType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | colors        | | -> ["red", "blue", "green", "black"]
| | __proto__     | | -> SuperType.prototype
| +---------------+ |
+-------------------+

Creating instance2 using new SubType():
Constructor Call Execution Context for SubType:
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

New Instance (instance2):
+-------------------+
| Properties        |
| +---------------+ |
| | __proto__     | | -> SubType.prototype
| +---------------+ |
+-------------------+

Accessing instance2.colors:
SubType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | colors        | | -> ["red", "blue", "green", "black"]
| | __proto__     | | -> SuperType.prototype
| +---------------+ |
+-------------------+
```

### 详细解释

- **Initial State**: 仅包含 `SuperType` 和 `SubType` 构造函数。
- **Prototype Initialization**: 初始化 `SuperType.prototype`，添加 `sayColors` 方法。
- **Setting `SubType.prototype`**: 将 `SubType.prototype` 设置为 `SuperType` 的一个新实例 `superInstance`。
- **Creating `instance1`**: 使用 `new SubType()` 创建新对象 `instance1`，其 `__proto__` 指向 `SubType.prototype`。
- **Modifying `instance1.colors`**: 修改 `colors` 数组，影响 `SubType.prototype` 上的 `colors` 属性。
- **Creating `instance2`**: 使用 `new SubType()` 创建新对象 `instance2`，其 `__proto__` 指向 `SubType.prototype`。
- **Accessing `instance2.colors`**: 访问 `instance2.colors`，由于 `colors` 是共享的，结果为 `["red", "blue", "green", "black"]`。

## 2. 借用构造函数继承

在子类型的构造函数中通过 `call` 或 `apply` 方法调用超类型的构造函数，从而实现属性的继承。这种方式可以在子类型构造函数中向超类型传递参数。

### 优点

- 可以在子类型构造函数中向超类型传递参数，解决了原型链继承中无法传递参数的问题。
- 每个实例都有自己独立的属性副本，不会相互干扰。

### 缺点

- 无法实现函数方法的复用，每个子类型实例都会创建一份超类型方法的副本。
- 超类型原型定义的方法子类型无法访问到。

### 示例代码

```javascript
function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}

let instance1 = new SubType('张三', 20);
console.log(instance1.name); // 张三
console.log(instance1.age); // 20
console.log(instance1.colors); // ["red", "blue", "green"]

let instance2 = new SubType('李四', 25);
console.log(instance2.name); // 李四
console.log(instance2.age); // 25
console.log(instance2.colors); // ["red", "blue", "green"]
```

### 内存分配示意图

```
Initial State:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | SuperType     | |
| | SubType       | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | SuperType -> [variable object] |
| | SubType -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Creating instance1 using new SubType("张三", 20):
Constructor Call Execution Context for SubType:
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

Calling SuperType.call(this, "张三"):
Constructor Call Execution Context for SuperType:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "张三"
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | arguments -> [activation object] |
| | name -> [activation object] |
| +------------------|
| This Binding: New Instance of SubType |
| Scope Chain: |
| -> Constructor Call Execution Context |
| -> Global Execution Context |
+-------------------+

New Instance (instance1):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "张三"
| | colors        | | -> ["red", "blue", "green"]
| | age           | | -> 20
| +---------------+ |
+-------------------+

Creating instance2 using new SubType("李四", 25):
Constructor Call Execution Context for SubType:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "李四"
| | age           | | -> 25
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

Calling SuperType.call(this, "李四"):
Constructor Call Execution Context for SuperType:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "李四"
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | arguments -> [activation object] |
| | name -> [activation object] |
| +------------------|
| This Binding: New Instance of SubType |
| Scope Chain: |
| -> Constructor Call Execution Context |
| -> Global Execution Context |
+-------------------+

New Instance (instance2):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "李四"
| | colors        | | -> ["red", "blue", "green"]
| | age           | | -> 25
| +---------------+ |
+-------------------+
```

### 详细解释

- **Initial State**: 仅包含 `SuperType` 和 `SubType` 构造函数。
- **Creating `instance1`**: 使用 `new SubType("张三", 20)` 创建新对象 `instance1`。
- **Calling `SuperType.call(this, "张三")`**: 在 `SubType` 构造函数中调用 `SuperType.call(this, "张三")`，初始化 `name` 和 `colors` 属性。
- **Creating `instance2`**: 使用 `new SubType("李四", 25)` 创建新对象 `instance2`。
- **Calling `SuperType.call(this, "李四")`**: 在 `SubType` 构造函数中调用 `SuperType.call(this, "李四")`，初始化 `name` 和 `colors` 属性。

## 3. 组合继承

结合了原型链继承和借用构造函数继承的优点。通过借用构造函数实现属性的继承，通过将子类型的原型设置为超类型的实例实现方法的继承。这种方式既可以在子类型构造函数中向超类型传递参数，又可以实现方法的复用。

### 优点

- 结合了原型链继承和借用构造函数继承的优点，既可以实现属性的继承，又可以实现方法的复用。
- 解决了单独使用原型链或借用构造函数继承时存在的问题。

### 缺点

- 调用了两次超类的构造函数，一次在创建子类型原型时，一次在子类型构造函数中。这会导致子类型的原型中多了很多不必要的属性。

### 示例代码

```javascript
function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}
SuperType.prototype.sayName = function () {
  console.log(this.name);
};

function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}
SubType.prototype = new SuperType();
SubType.prototype.constructor = SubType;
SubType.prototype.sayAge = function () {
  console.log(this.age);
};

let instance1 = new SubType('张三', 20);
instance1.colors.push('black');
console.log(instance1.name); // 张三
console.log(instance1.age); // 20
console.log(instance1.colors); // ["red", "blue", "green", "black"]

let instance2 = new SubType('李四', 25);
console.log(instance2.name); // 李四
console.log(instance2.age); // 25
console.log(instance2.colors); // ["red", "blue", "green"]
```

### 内存分配示意图

```
Initial State:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | SuperType     | |
| | SubType       | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | SuperType -> [variable object] |
| | SubType -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Prototype Initialization:
SuperType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | constructor   | | -> SuperType
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

Setting SubType.prototype to new SuperType():
Constructor Call Execution Context for SuperType:
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

New Instance (superInstance):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> undefined
| | colors        | | -> ["red", "blue", "green"]
| | __proto__     | | -> SuperType.prototype
| +---------------+ |
+-------------------+

After returning superInstance:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | SuperType     | |
| | SubType       | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | SuperType -> [variable object] |
| | SubType -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Setting SubType.prototype to superInstance:
SubType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> undefined
| | colors        | | -> ["red", "blue", "green"]
| | __proto__     | | -> SuperType.prototype
| +---------------+ |
+-------------------+

Fixing SubType.prototype.constructor:
SubType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> undefined
| | colors        | | -> ["red", "blue", "green"]
| | __proto__     | | -> SuperType.prototype
| | constructor   | | -> SubType
| +---------------+ |
+-------------------+

Adding method sayAge to SubType.prototype:
SubType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> undefined
| | colors        | | -> ["red", "blue", "green"]
| | __proto__     | | -> SuperType.prototype
| | constructor   | | -> SubType
| | sayAge        | | -> [function]
| +---------------+ |
+-------------------+

Function Creation (sayAge):
+-------------------+
| Code              |
| +---------------+ |
| | console.log(this.age); |
| +---------------+ |
+-------------------+

Creating instance1 using new SubType("张三", 20):
Constructor Call Execution Context for SubType:
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

Calling SuperType.call(this, "张三"):
Constructor Call Execution Context for SuperType:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "张三"
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | arguments -> [activation object] |
| | name -> [activation object] |
| +------------------|
| This Binding: New Instance of SubType |
| Scope Chain: |
| -> Constructor Call Execution Context |
| -> Global Execution Context |
+-------------------+

New Instance (instance1):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "张三"
| | colors        | | -> ["red", "blue", "green"]
| | age           | | -> 20
| | __proto__     | | -> SubType.prototype
| +---------------+ |
+-------------------+

Modifying instance1.colors:
SubType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> undefined
| | colors        | | -> ["red", "blue", "green", "black"]
| | __proto__     | | -> SuperType.prototype
| | constructor   | | -> SubType
| | sayAge        | | -> [function]
| +---------------+ |
+-------------------+

Creating instance2 using new SubType("李四", 25):
Constructor Call Execution Context for SubType:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "李四"
| | age           | | -> 25
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

Calling SuperType.call(this, "李四"):
Constructor Call Execution Context for SuperType:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "李四"
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | arguments -> [activation object] |
| | name -> [activation object] |
| +------------------|
| This Binding: New Instance of SubType |
| Scope Chain: |
| -> Constructor Call Execution Context |
| -> Global Execution Context |
+-------------------+

New Instance (instance2):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "李四"
| | colors        | | -> ["red", "blue", "green"]
| | age           | | -> 25
| | __proto__     | | -> SubType.prototype
| +---------------+ |
+-------------------+
```

### 详细解释

- **Initial State**: 仅包含 `SuperType` 和 `SubType` 构造函数。
- **Prototype Initialization**: 初始化 `SuperType.prototype`，添加 `sayName` 方法。
- **Setting `SubType.prototype`**: 将 `SubType.prototype` 设置为 `SuperType` 的一个新实例 `superInstance`。
- **Fixing `SubType.prototype.constructor`**: 将 `SubType.prototype.constructor` 指回 `SubType`。
- **Adding Method `sayAge`**: 添加 `sayAge` 方法到 `SubType.prototype`。
- **Creating `instance1`**: 使用 `new SubType("张三", 20)` 创建新对象 `instance1`，其 `__proto__` 指向 `SubType.prototype`。
- **Calling `SuperType.call(this, "张三")`**: 在 `SubType` 构造函数中调用 `SuperType.call(this, "张三")`，初始化 `name` 和 `colors` 属性。
- **Modifying `instance1.colors`**: 修改 `colors` 数组，影响 `SubType.prototype` 上的 `colors` 属性。
- **Creating `instance2`**: 使用 `new SubType("李四",25)` 创建新对象 `instance2`，其 `__proto__` 指向 `SubType.prototype`。
- **Calling `SuperType.call(this, "李四")`**: 在 `SubType` 构造函数中调用 `SuperType.call(this, "李四")`，初始化 `name` 和 `colors` 属性。

## 4. 原型式继承

基于已有的对象创建新对象，通过向函数中传入一个对象，然后返回一个以这个对象为原型的新对象。ES5 中定义的 `Object.create()` 方法就是原型式继承的实现。

### 优点

- 实现简单，适用于对某个对象实现简单继承。
- 不需要定义构造函数，可以直接基于现有对象进行扩展。

### 缺点

- 包含引用类型值的原型属性会被所有实例共享，容易造成修改的混乱。
- 没有解决原型链继承中无法传递参数的问题。

### 示例代码

```javascript
let person = {
  name: '张三',
  friends: ['李四', '王五'],
};

let anotherPerson = Object.create(person);
anotherPerson.name = '李四';
anotherPerson.friends.push('赵六');

let yetAnotherPerson = Object.create(person);
yetAnotherPerson.name = '王五';

console.log(yetAnotherPerson.friends); // ["李四", "王五", "赵六"]
```

### 内存分配示意图

```
Initial State:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | person        | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | person -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Creating anotherPerson using Object.create(person):
Execution Context:
+-------------------+
| Activation Object |
| +---------------+ |
| | prototype     | | -> person
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | prototype -> [activation object] |
| +------------------|
| This Binding: Global Execution Context's this binding |
| Scope Chain: |
| -> Global Execution Context |
+-------------------+

New Instance (anotherPerson):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "李四"
| | __proto__     | | -> person
| +---------------+ |
+-------------------+

After returning anotherPerson:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | person        | |
| | anotherPerson | | -> [anotherPerson object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | person -> [variable object] |
| | anotherPerson -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Modifying anotherPerson.friends:
person:
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "张三"
| | friends       | | -> ["李四", "王五", "赵六"]
| +---------------+ |
+-------------------+

Creating yetAnotherPerson using Object.create(person):
Execution Context:
+-------------------+
| Activation Object |
| +---------------+ |
| | prototype     | | -> person
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | prototype -> [activation object] |
| +------------------|
| This Binding: Global Execution Context's this binding |
| Scope Chain: |
| -> Global Execution Context |
+-------------------+

New Instance (yetAnotherPerson):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "王五"
| | __proto__     | | -> person
| +---------------+ |
+-------------------+

After returning yetAnotherPerson:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | person        | |
| | anotherPerson | | -> [anotherPerson object]
| | yetAnotherPerson | | -> [yetAnotherPerson object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | person -> [variable object] |
| | anotherPerson -> [variable object] |
| | yetAnotherPerson -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Accessing yetAnotherPerson.friends:
person:
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "张三"
| | friends       | | -> ["李四", "王五", "赵六"]
| +---------------+ |
+-------------------+
```

### 详细解释

- **Initial State**: 仅包含 `person` 对象。
- **Creating `anotherPerson`**: 使用 `Object.create(person)` 创建新对象 `anotherPerson`，其 `__proto__` 指向 `person`。
- **Modifying `anotherPerson.friends`**: 修改 `friends` 数组，影响 `person` 上的 `friends` 属性。
- **Creating `yetAnotherPerson`**: 使用 `Object.create(person)` 创建新对象 `yetAnotherPerson`，其 `__proto__` 指向 `person`。
- **Accessing `yetAnotherPerson.friends`**: 访问 `yetAnotherPerson.friends`，由于 `friends` 是共享的，结果为 `["李四", "王五", "赵六"]`。

## 5. 寄生式继承

创建一个用于封装继承过程的函数，通过传入一个对象，然后复制一个对象的副本，然后对副本进行扩展，最后返回这个副本。这种扩展的过程可以理解为一种继承。

### 优点

- 适用于对一个简单对象实现继承，如果这个对象不是自定义类型时。
- 可以灵活地为对象添加新的属性和方法。

### 缺点

- 没有解决函数复用的问题，每个继承的对象都会创建一份方法的副本。
- 没有解决原型链继承中无法传递参数的问题。

### 示例代码

```javascript
function createAnother(original) {
  let clone = Object.create(original);
  clone.sayHi = function () {
    console.log('Hi!');
  };
  return clone;
}

let person = {
  name: '张三',
  friends: ['李四', '王五'],
};

let anotherPerson = createAnother(person);
anotherPerson.sayHi(); // Hi!
```

### 内存分配示意图

```
Initial State:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | createAnother | |
| | person        | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | createAnother -> [variable object] |
| | person -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Creating anotherPerson using createAnother(person):
Execution Context:
+-------------------+
| Activation Object |
| +---------------+ |
| | original      | | -> person
| | clone         | | -> [object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | original -> [activation object] |
| | clone -> [activation object] |
| +------------------|
| This Binding: Global Execution Context's this binding |
| Scope Chain: |
| -> Global Execution Context |
+-------------------+

Cloning person:
Clone (clone):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "张三"
| | friends       | | -> ["李四", "王五"]
| | __proto__     | | -> person
| +---------------+ |
+-------------------+

Adding method sayHi to clone:
Clone (clone):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "张三"
| | friends       | | -> ["李四", "王五"]
| | __proto__     | | -> person
| | sayHi         | | -> [function]
| +---------------+ |
+-------------------+

Function Creation (sayHi):
+-------------------+
| Code              |
| +---------------+ |
| | console.log("Hi!"); |
| +---------------+ |
+-------------------+

After returning clone:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | createAnother | |
| | person        | |
| | anotherPerson | | -> [anotherPerson object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | createAnother -> [variable object] |
| | person -> [variable object] |
| | anotherPerson -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Calling anotherPerson.sayHi():
Execution Context:
+-------------------+
| Activation Object |
| +---------------+ |
| | this          | | -> anotherPerson
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | this -> [activation object] |
| +------------------|
| This Binding: anotherPerson |
| Scope Chain: |
| -> Execution Context |
| -> Global Execution Context |
+-------------------+

Output: Hi!
```

### 详细解释

- **Initial State**: 仅包含 `createAnother` 函数和 `person` 对象。
- **Creating `anotherPerson`**: 使用 `createAnother(person)` 创建新对象 `anotherPerson`，其 `__proto__` 指向 `person`。
- **Cloning `person`**: 复制 `person` 的属性到 `clone`。
- **Adding Method `sayHi`**: 向 `clone` 添加 `sayHi` 方法。
- **After Returning `clone`**: 将 `clone` 赋值给 `anotherPerson`。
- **Calling `anotherPerson.sayHi()`**: 调用 `sayHi` 方法，输出 `Hi!`。

## 6. 寄生式组合继承

通过将超类型的原型的副本作为子类型的原型，避免了组合继承中创建不必要的属性。这种方式既可以在子类型构造函数中向超类型传递参数，又可以实现方法的复用，且不会创建不必要的属性。

### 优点

- 避免了组合继承中创建不必要的属性，既可以在子类型构造函数中向超类型传递参数，又可以实现方法的复用。
- 性能较好，是目前最常用的继承方式之一。

### 缺点

- 实现相对复杂，需要理解原型链和构造函数的关系。

### 示例代码

```javascript
function inheritPrototype(subType, superType) {
  let prototype = Object.create(superType.prototype);
  prototype.constructor = subType;
  subType.prototype = prototype;
}

function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}
SuperType.prototype.sayName = function () {
  console.log(this.name);
};

function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}
inheritPrototype(SubType, SuperType);

SubType.prototype.sayAge = function () {
  console.log(this.age);
};

let instance1 = new SubType('张三', 20);
instance1.colors.push('black');
console.log(instance1.name); // 张三
console.log(instance1.age); // 20
console.log(instance1.colors); // ["red", "blue", "green", "black"]

let instance2 = new SubType('李四', 25);
console.log(instance2.name); // 李四
console.log(instance2.age); // 25
console.log(instance2.colors); // ["red", "blue", "green"]
```

### 内存分配示意图

```
Initial State:
Global Execution Context:
+-------------------+
| Variable Object   |
| +---------------+ |
| | inheritPrototype | |
| | SuperType      | |
| | SubType        | |
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | inheritPrototype -> [variable object] |
| | SuperType -> [variable object] |
| | SubType -> [variable object] |
| +------------------|
| This Binding: window |
+-------------------+

Prototype Initialization:
SuperType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | constructor   | | -> SuperType
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

Defining inheritPrototype Function:
Function (inheritPrototype):
+-------------------+
| Code              |
| +---------------+ |
| | let prototype = Object.create(superType.prototype); |
| | prototype.constructor = subType; |
| | subType.prototype = prototype; |
| +---------------+ |
+-------------------+

Using inheritPrototype to set SubType.prototype:
Execution Context:
+-------------------+
| Activation Object |
| +---------------+ |
| | subType       | | -> SubType
| | superType     | | -> SuperType
| | prototype     | | -> [object]
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | subType -> [activation object] |
| | superType -> [activation object] |
| | prototype -> [activation object] |
| +------------------|
| This Binding: Global Execution Context's this binding |
| Scope Chain: |
| -> Global Execution Context |
+-------------------+

Creating prototype as a copy of SuperType.prototype:
Prototype (prototype):
+-------------------+
| Properties        |
| +---------------+ |
| | constructor   | | -> SuperType
| | sayName       | | -> [function]
| +---------------+ |
+-------------------+

Setting prototype.constructor to SubType:
Prototype (prototype):
+-------------------+
| Properties        |
| +---------------+ |
| | constructor   | | -> SubType
| | sayName       | | -> [function]
| +---------------+ |
+-------------------+

Setting SubType.prototype to prototype:
SubType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | constructor   | | -> SubType
| | sayName       | | -> [function]
| +---------------+ |
+-------------------+

Adding method sayAge to SubType.prototype:
SubType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | constructor   | | -> SubType
| | sayName       | | -> [function]
| | sayAge        | | -> [function]
| +---------------+ |
+-------------------+

Function Creation (sayAge):
+-------------------+
| Code              |
| +---------------+ |
| | console.log(this.age); |
| +---------------+ |
+-------------------+

Creating instance1 using new SubType("张三", 20):
Constructor Call Execution Context for SubType:
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

Calling SuperType.call(this, "张三"):
Constructor Call Execution Context for SuperType:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "张三"
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | arguments -> [activation object] |
| | name -> [activation object] |
| +------------------|
| This Binding: New Instance of SubType |
| Scope Chain: |
| -> Constructor Call Execution Context |
| -> Global Execution Context |
+-------------------+

New Instance (instance1):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "张三"
| | colors        | | -> ["red", "blue", "green"]
| | age           | | -> 20
| | __proto__     | | -> SubType.prototype
| +---------------+ |
+-------------------+

Modifying instance1.colors:
SubType Prototype:
+-------------------+
| Properties        |
| +---------------+ |
| | constructor   | | -> SubType
| | sayName       | | -> [function]
| | sayAge        | | -> [function]
| +---------------+ |
+-------------------+

Creating instance2 using new SubType("李四", 25):
Constructor Call Execution Context for SubType:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "李四"
| | age           | | -> 25
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

Calling SuperType.call(this, "李四"):
Constructor Call Execution Context for SuperType:
+-------------------+
| Activation Object |
| +---------------+ |
| | arguments     | |
| | name          | | -> "李四"
| +---------------+ |
+-------------------+
| Lexical Environment: |
| +------------------|
| | arguments -> [activation object] |
| | name -> [activation object] |
| +------------------|
| This Binding: New Instance of SubType |
| Scope Chain: |
| -> Constructor Call Execution Context |
| -> Global Execution Context |
+-------------------+

New Instance (instance2):
+-------------------+
| Properties        |
| +---------------+ |
| | name          | | -> "李四"
| | colors        | | -> ["red", "blue", "green"]
| | age           | | -> 25
| | __proto__     | | -> SubType.prototype
| +---------------+ |
+-------------------+
```

### 详细解释

- **Initial State**: 仅包含 `inheritPrototype` 函数、`SuperType` 构造函数和 `SubType` 构造函数。
- **Prototype Initialization**: 初始化 `SuperType.prototype`，添加 `sayName` 方法。
- **Defining `inheritPrototype` Function**: 定义 `inheritPrototype` 函数，用于设置子类型的原型为超类型原型的一个副本，并修复构造函数指针。
- **Using `inheritPrototype` to Set `SubType.prototype`**: 调用 `inheritPrototype(SubType, SuperType)`，将 `SubType.prototype` 设置为 `SuperType.prototype` 的一个副本，并修复 `constructor` 指针。
- **Adding Method `sayAge`**: 向 `SubType.prototype` 添加 `sayAge` 方法。
- **Creating `instance1`**: 使用 `new SubType("张三", 20)` 创建新对象 `instance1`，其 `__proto__` 指向 `SubType.prototype`。
- **Calling `SuperType.call(this, "张三")`**: 在 `SubType` 构造函数中调用 `SuperType.call(this, "张三")`，初始化 `name` 和 `colors` 属性。
- **Modifying `instance1.colors`**: 修改 `colors` 数组，不影响其他实例。
- **Creating `instance2`**: 使用 `new SubType("李四", 25)` 创建新对象 `instance2`，其 `__proto__` 指向 `SubType.prototype`。
- **Calling `SuperType.call(this, "李四")`**: 在 `SubType` 构造函数中调用 `SuperType.call(this, "李四")`，初始化 `name` 和 `colors` 属性。
