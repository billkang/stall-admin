# 对象创建方式概括

## 1. 工厂模式

通过函数封装创建对象的细节，调用函数复用代码。但创建出的对象无法与特定类型关联，只是简单封装复用代码，未建立对象与类型间关系。

* 优点：通过函数封装创建对象的细节，调用函数可复用代码，简单易懂，适合创建少量相似对象。
* 缺点：创建出的对象无法与某个特定类型联系起来，只是简单封装了复用代码，没有建立起对象和类型间的关系，不利于对象的识别和管理。

* 示例代码

```javascript
function createPerson(name, age) {
    let obj = new Object();
    obj.name = name;
    obj.age = age;
    obj.sayName = function() {
        console.log(this.name);
    };
    return obj;
}
let person1 = createPerson("张三", 20);
let person2 = createPerson("李四", 25);
```

## 2. 构造函数模式

js中每个函数可作为构造函数，用new调用。执行时先创建对象，将对象原型指向构造函数prototype属性，this指向新对象，再执行函数，若返回值非对象则返回新建对象。优点是创建对象与构造函数建立联系，可通过原型识别对象类型。缺点是若对象属性含函数，每次都会新建函数对象，浪费内存，因为函数是所有实例通用的。

* 优点：所创建的对象和构造函数建立起了联系，可以通过原型来识别对象的类型，为对象的识别和管理提供了便利，适合创建大量相似对象且需要明确对象类型的情况。
* 缺点：造成了不必要的函数对象的创建，因为在js中函数也是一个对象，如果对象属性中包含函数的话，那么每次都会新建一个函数对象，浪费了不必要的内存空间，因为函数是所有的实例都可以通用的，不利于代码的复用和内存的优化。

* 示例代码

``` javascript
function Person(name, age) {
    this.name = name;
    this.age = age;
    this.sayName = function() {
        console.log(this.name);
    };
}
let person1 = new Person("张三", 20);
let person2 = new Person("李四", 25);
```

## 3. 原型模式

每个函数有prototype属性，是对象，包含通过构造函数创建的所有实例共享的属性和方法。用原型对象添加公用属性和方法实现代码复用，解决构造函数模式函数对象复用问题。但无法通过传参初始化值，且引用类型值如Array等，所有实例共享，一实例改变影响所有实例。

* 优点：可以使用原型对象来添加公用属性和方法，从而实现代码的复用，解决了构造函数模式中函数对象无法复用的问题，提高了内存的利用效率，适合创建大量相似对象且需要共享方法的情况。
* 缺点：没有办法通过传入参数来初始化值，灵活性较差；如果存在一个引用类型如Array这样的值，那么所有的实例将共享一个对象，一个实例对引用类型值的改变会影响所有的实例，可能会导致数据的错误共享和修改，存在一定的安全隐患。

* 示例代码

``` javascript
function Person() {}
Person.prototype.name = "张三";
Person.prototype.age = 20;
Person.prototype.sayName = function() {
    console.log(this.name);
};
let person1 = new Person();
let person2 = new Person();
```

## 4. 组合使用构造函数模式和原型模式

是创建自定义类型最常见方式。分开使用两种模式有缺点，组合用可解决，用构造函数初始化对象属性，用原型对象实现函数方法复用。但代码封装性不够好，因用了两种不同模式。

* 优点：综合了构造函数模式和原型模式的优点，通过构造函数来初始化对象的属性，通过原型对象来实现函数方法的复用，既解决了构造函数模式中函数对象无法复用的问题，又解决了原型模式无法通过传入参数初始化值的问题，是创建自定义类型的最常见且较为理想的方式，能够较好地满足多种开发需求。
* 缺点：因为使用了两种不同的模式，所以对于代码的封装性不够好，代码结构相对复杂一些，初学者可能需要花费一些时间去理解和掌握，而且在维护和扩展时也需要同时考虑两种模式的兼容性。

* 示例代码

``` javascript
function Person(name, age) {
    this.name = name;
    this.age = age;
}
Person.prototype.sayName = function() {
    console.log(this.name);
};
let person1 = new Person("张三", 20);
let person2 = new Person("李四", 25);
```

## 5. 动态原型模式

将原型方法赋值创建过程移到构造函数内部，通过判断属性是否存在，实现仅第一次调用函数时对原型对象赋值一次，对混合模式进行了封装。

* 优点：将原型方法赋值的创建过程移动到了构造函数的内部，通过对属性是否存在的判断，可以实现仅在第一次调用函数时对原型对象赋值一次的效果，很好地对组合使用构造函数模式和原型模式的混合模式进行了封装，使得代码更加简洁、易于理解和维护，同时避免了多次对原型对象进行不必要的赋值操作，提高了代码的执行效率。
* 缺点：在一定程度上增加了代码的复杂性，对于初学者来说可能不太容易理解其原理和实现方式，而且如果在构造函数内部对原型对象进行过多的操作，可能会导致构造函数的执行时间变长，影响对象的创建效率。

* 示例代码

``` javascript
function Person(name, age) {
    if (typeof Person._initialized === "undefined") {
        Person.prototype.sayName = function() {
            console.log(this.name);
        };
        Person._initialized = true;
    }
    this.name = name;
    this.age = age;
}
let person1 = new Person("张三", 20);
let person2 = new Person("李四", 25);
```

## 6. 寄生构造函数模式

和工厂模式实现基本相同，基于已有类型，在实例化时对实例化对象扩展。不改原构造函数，达扩展对象目的。缺点和工厂模式一样，无法实现对象识别。

* 优点：主要是基于一个已有的类型，在实例化时对实例化的对象进行扩展。这样既不用修改原来的构造函数，也达到了扩展对象的目的，可以在不改变原有构造函数的基础上，灵活地为对象添加新的属性和方法，具有一定的灵活性和扩展性，适用于对已有类型进行小范围的定制和扩展的场景。
* 缺点：和工厂模式一样，无法实现对象的识别，因为通过这种方式创建的对象无法与某个特定的类型关联起来，不利于对象的管理和维护，而且由于它没有充分利用原型链的特性，所以无法实现方法的复用，每次创建对象时都需要重新创建方法，可能会导致内存的浪费。

* 示例代码

``` javascript
function Person(name, age) {
    let obj = new Object();
    obj.name = name;
    obj.age = age;
    obj.sayName = function() {
        console.log(this.name);
    };
    return obj;
}
let person1 = new Person("张三", 20);
let person2 = new Person("李四", 25);
```
