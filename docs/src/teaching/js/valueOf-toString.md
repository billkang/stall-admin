# JavaScript 中的 `valueOf` 和 `toString` 方法

理解JavaScript中的`valueOf`和`toString`方法对于掌握对象转换为原始值的过程至关重要。这两个方法在不同的场景下发挥作用，帮助开发者自定义对象的行为。以下是详细的解释和代码示例。

## 1. `valueOf` 方法

`valueOf` 方法返回指定对象的原始值。默认情况下，大多数内置对象都有自己的 `valueOf` 方法，但你可以重写这个方法以改变其行为。

### 默认行为

- **Number**: 返回数字本身。
- **String**: 返回字符串本身。
- **Boolean**: 返回布尔值本身。
- **Array**: 返回数组本身（不是其元素）。
- **Object**: 返回对象本身（不是其属性）。

#### 示例代码

```javascript
var num = 42;
console.log(num.valueOf()); // 输出: 42

var str = "Hello";
console.log(str.valueOf()); // 输出: Hello

var bool = true;
console.log(bool.valueOf()); // 输出: true

var arr = [1, 2, 3];
console.log(arr.valueOf()); // 输出: [1, 2, 3]

var obj = { name: 'Alice' };
console.log(obj.valueOf()); // 输出: { name: 'Alice' }
```

#### 内存示意图

```plaintext
Global Execution Context:
+------------------------+
| num                    |
| str                    |
| bool                   |
| arr                    |
| obj                    |
+------------------------+
|                        |
| Global Object (window) |
|                        |
+------------------------+
```

### 自定义 `valueOf` 方法

你可以重写对象的 `valueOf` 方法以返回自定义的原始值。

#### 示例代码

```javascript
function MyNumber(value) {
    this.value = value;
}

MyNumber.prototype.valueOf = function() {
    return this.value * 2;
};

var myNum = new MyNumber(10);
console.log(myNum.valueOf()); // 输出: 20
console.log(Number(myNum)); // 输出: 20 (自动调用 valueOf)
console.log(myNum + 5); // 输出: 25 (自动调用 valueOf)
```

#### 内存示意图

```plaintext
Global Execution Context:
+------------------------+
| MyNumber               |
| myNum                  |
+------------------------+
|                        |
| Global Object (window) |
|                        |
+------------------------+

When myNum.valueOf() is called:
MyNumber Prototype:
+-----------------------------+
| valueOf                     |
+-----------------------------+
| MyNumber Scope Chain        |
| -> Global Execution Context |
+-----------------------------+
```

## 2. `toString` 方法

`toString` 方法返回一个表示对象的字符串。默认情况下，大多数内置对象都有自己的 `toString` 方法，但你可以重写这个方法以改变其行为。

### 默认行为

- **Number**: 返回数字对应的字符串。
- **String**: 返回字符串本身。
- **Boolean**: 返回布尔值对应的字符串 ("true" 或 "false")。
- **Array**: 返回逗号分隔的元素组成的字符串。
- **Object**: 返回 "[object Object]"。

#### 示例代码

```javascript
var num = 42;
console.log(num.toString()); // 输出: "42"

var str = "Hello";
console.log(str.toString()); // 输出: "Hello"

var bool = true;
console.log(bool.toString()); // 输出: "true"

var arr = [1, 2, 3];
console.log(arr.toString()); // 输出: "1,2,3"

var obj = { name: 'Alice' };
console.log(obj.toString()); // 输出: "[object Object]"
```

#### 内存示意图

```plaintext
Global Execution Context:
+------------------------+
| num                    |
| str                    |
| bool                   |
| arr                    |
| obj                    |
+------------------------+
|                        |
| Global Object (window) |
|                        |
+------------------------+
```

### 自定义 `toString` 方法

你可以重写对象的 `toString` 方法以返回自定义的字符串表示。

#### 示例代码

```javascript
function MyDate(year, month, day) {
    this.year = year;
    this.month = month;
    this.day = day;
}

MyDate.prototype.toString = function() {
    return `${this.year}-${this.month}-${this.day}`;
};

var date = new MyDate(2023, 10, 5);
console.log(date.toString()); // 输出: "2023-10-5"
console.log(String(date)); // 输出: "2023-10-5" (自动调用 toString)
console.log(`${date}`); // 输出: "2023-10-5" (自动调用 toString)
```

#### 内存示意图

```plaintext
Global Execution Context:
+------------------------+
| MyDate                 |
| date                   |
+------------------------+
|                        |
| Global Object (window) |
|                        |
+------------------------+

When date.toString() is called:
MyDate Prototype:
+-----------------------------+
| toString                    |
+-----------------------------+
| MyDate Scope Chain          |
| -> Global Execution Context |
+-----------------------------+
```

## 3. 结合使用 `valueOf` 和 `toString`

当你尝试将对象转换为基本类型时，JavaScript 首先会尝试调用 `valueOf` 方法。如果 `valueOf` 没有返回基本类型，则调用 `toString` 方法。

### 示例代码

```javascript
function MyComplexObject(value) {
    this.value = value;
}

MyComplexObject.prototype.valueOf = function() {
    console.log('valueOf called');
    return this.value;
};

MyComplexObject.prototype.toString = function() {
    console.log('toString called');
    return String(this.value);
};

var complexObj = new MyComplexObject(42);

console.log(complexObj + ''); // 输出: valueOf called \n 42
console.log(String(complexObj)); // 输出: valueOf called \n 42
console.log(complexObj.toString()); // 输出: toString called \n 42
console.log(complexObj.valueOf()); // 输出: valueOf called \n 42
```

## 4. 复杂场景下的 `valueOf` 使用

### 场景1：货币类

假设我们有一个货币类，希望在计算时返回数值，在显示时返回格式化的字符串。

#### 示例代码

```javascript
function Currency(amount) {
    this.amount = amount;
}

Currency.prototype.valueOf = function() {
    return this.amount;
};

Currency.prototype.toString = function() {
    return `$${this.amount.toFixed(2)}`;
};

var price = new Currency(99.99);

console.log(price + 1); // 输出: 100.99 (valueOf 被调用)
console.log(String(price)); // 输出: $99.99 (toString 被调用)
console.log(price.toString()); // 输出: $99.99 (toString 被显式调用)
```

### 场景2：日期范围类

假设我们有一个日期范围类，希望在比较时返回开始日期的时间戳，在显示时返回格式化的日期范围字符串。

#### 示例代码

```javascript
function DateRange(start, end) {
    this.start = start;
    this.end = end;
}

DateRange.prototype.valueOf = function() {
    return this.start.getTime();
};

DateRange.prototype.toString = function() {
    return `${this.start.toDateString()} to ${this.end.toDateString()}`;
};

var range = new DateRange(new Date(2023, 9, 1), new Date(2023, 9, 30));

console.log(range > new Date(2023, 8, 30)); // 输出: true (valueOf 被调用)
console.log(String(range)); // 输出: Sun Oct 01 2023 to Tue Oct 31 2023 (toString 被调用)
console.log(range.toString()); // 输出: Sun Oct 01 2023 to Tue Oct 31 2023 (toString 被显式调用)
```

### 场景3：矩阵类

假设我们有一个矩阵类，希望在加法运算时返回一个新的矩阵，在显示时返回矩阵的字符串表示。

#### 示例代码

```javascript
function Matrix(rows, cols, data) {
    this.rows = rows;
    this.cols = cols;
    this.data = data || Array.from({ length: rows }, () => Array(cols).fill(0));
}

Matrix.prototype.valueOf = function() {
    return this.data.flat();
};

Matrix.prototype.toString = function() {
    return this.data.map(row => row.join('\t')).join('\n');
};

Matrix.prototype.add = function(other) {
    if (this.rows !== other.rows || this.cols !== other.cols) {
        throw new Error("Matrices must have the same dimensions");
    }
    let newData = [];
    for (let i = 0; i < this.rows; i++) {
        newData[i] = [];
        for (let j = 0; j < this.cols; j++) {
            newData[i][j] = this.data[i][j] + other.data[i][j];
        }
    }
    return new Matrix(this.rows, this.cols, newData);
};

var matrixA = new Matrix(2, 2, [[1, 2], [3, 4]]);
var matrixB = new Matrix(2, 2, [[5, 6], [7, 8]]);

var resultMatrix = matrixA.add(matrixB);

console.log(resultMatrix.valueOf()); // 输出: [6, 8, 10, 12]
console.log(String(resultMatrix)); // 输出: 6 8\n10 12
console.log(resultMatrix.toString()); // 输出: 6 8\n10 12
```
