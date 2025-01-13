# 对象继承方式总结

## 1. 原型链继承

描述：通过将子类型的原型指向超类型的实例，使得子类型能够访问超类型原型上的方法和属性，从而实现继承。

* 优点：实现简单，能够共享超类型的原型中的方法和属性。
* 缺点：包含引用类型值的原型属性会被所有实例共享，容易造成修改的混乱；在创建子类型的时候不能向超类型传递参数。

* 示例代码

``` javascript
function SuperType() {
    this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayColors = function() {
    console.log(this.colors);
};
function SubType() {}
SubType.prototype = new SuperType();
let instance1 = new SubType();
instance1.colors.push("black");
let instance2 = new SubType();
console.log(instance2.colors); // ["red", "blue", "green", "black"]
```

## 2. 借用构造函数继承

描述：在子类型的构造函数中通过call或apply方法调用超类型的构造函数，从而实现属性的继承。这种方式可以在子类型构造函数中向超类型传递参数。

* 优点：可以在子类型构造函数中向超类型传递参数，解决了原型链继承中无法传递参数的问题。
* 缺点：无法实现函数方法的复用，每个子类型实例都会创建一份超类型方法的副本；超类型原型定义的方法子类型无法访问到。

* 示例代码

``` javascript
function SuperType(name) {
    this.name = name;
    this.colors = ["red", "blue", "green"];
}
function SubType(name, age) {
    SuperType.call(this, name);
    this.age = age;
}
let instance1 = new SubType("张三", 20);
console.log(instance1.name); // 张三
console.log(instance1.age); // 20
console.log(instance1.colors); // ["red", "blue", "green"]
```

## 3. 组合继承

描述：结合了原型链继承和借用构造函数继承的优点。通过借用构造函数实现属性的继承，通过将子类型的原型设置为超类型的实例实现方法的继承。这种方式既可以在子类型构造函数中向超类型传递参数，又可以实现方法的复用。

* 优点：结合了原型链继承和借用构造函数继承的优点，既可以通过借用构造函数实现属性的继承，又可以通过原型链实现方法的继承，解决了单独使用原型链或借用构造函数继承时存在的问题。
* 缺点：调用了两次超类的构造函数，一次在创建子类型原型时，一次在子类型构造函数中。这会导致子类型的原型中多了很多不必要的属性。

* 示例代码
``` javascript
function SuperType(name) {
    this.name = name;
    this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function() {
    console.log(this.name);
};
function SubType(name, age) {
    SuperType.call(this, name);
    this.age = age;
}
SubType.prototype = new SuperType();
SubType.prototype.constructor = SubType;
SubType.prototype.sayAge = function() {
    console.log(this.age);
};
let instance1 = new SubType("张三", 20);
instance1.colors.push("black");
console.log(instance1.name); // 张三
console.log(instance1.age); // 20
console.log(instance1.colors); // ["red", "blue", "green", "black"]
let instance2 = new SubType("李四", 25);
console.log(instance2.name); // 李四
console.log(instance2.age); // 25
console.log(instance2.colors); // ["red", "blue", "green"]
```

## 4. 原型式继承

描述：基于已有的对象创建新对象，通过向函数中传入一个对象，然后返回一个以这个对象为原型的新对象。ES5 中定义的 Object.create() 方法就是原型式继承的实现。

* 优点：实现简单，适用于对某个对象实现简单继承。
* 缺点：包含引用类型值的原型属性会被所有实例共享，容易造成修改的混乱；没有解决原型链继承中无法传递参数的问题。

* 示例代码

``` javascript
let person = {
    name: "张三",
    friends: ["李四", "王五"]
};
let anotherPerson = Object.create(person);
anotherPerson.name = "李四";
anotherPerson.friends.push("赵六");
let yetAnotherPerson = Object.create(person);
yetAnotherPerson.name = "王五";
console.log(yetAnotherPerson.friends); // ["李四", "王五", "赵六"]
```

## 5. 寄生式继承

描述：创建一个用于封装继承过程的函数，通过传入一个对象，然后复制一个对象的副本，然后对副本进行扩展，最后返回这个副本。这种扩展的过程可以理解为一种继承。

* 优点：适用于对一个简单对象实现继承，如果这个对象不是自定义类型时。
* 缺点：没有解决函数复用的问题，每个继承的对象都会创建一份方法的副本；没有解决原型链继承中无法传递参数的问题。

* 示例代码

``` javascript
function createAnother(original) {
    let clone = Object.create(original);
    clone.sayHi = function() {
        console.log("Hi!");
    };
    return clone;
}
let person = {
    name: "张三",
    friends: ["李四", "王五"]
};
let anotherPerson = createAnother(person);
anotherPerson.sayHi(); // Hi!
```

## 6. 寄生式组合继承

描述：通过将超类型的原型的副本作为子类型的原型，避免了组合继承中创建不必要的属性。这种方式既可以在子类型构造函数中向超类型传递参数，又可以实现方法的复用，且不会创建不必要的属性。

* 优点：避免了组合继承中创建不必要的属性，既可以在子类型构造函数中向超类型传递参数，又可以实现方法的复用。
* 缺点：实现相对复杂，需要理解原型链和构造函数的关系。

* 示例代码

``` javascript
function inheritPrototype(subType, superType) {
    let prototype = Object.create(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
}
function SuperType(name) {
    this.name = name;
    this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function() {
    console.log(this.name);
};
function SubType(name, age) {
    SuperType.call(this, name);
    this.age = age;
}
inheritPrototype(SubType, SuperType);
SubType.prototype.sayAge = function() {
    console.log(this.age);
};
let instance1 = new SubType("张三", 20);
instance1.colors.push("black");
console.log(instance1.name); // 张三
console.log(instance1.age); // 20
console.log(instance1.colors); // ["red", "blue", "green", "black"]
let instance2 = new SubType("李四", 25);
console.log(instance2.name); // 李四
console.log(instance2.age); // 25
console.log(instance2.colors); // ["red", "blue", "green"]
```
