# Vue3 模版编译原理

Vue 3 的模板编译分为四个主要阶段，每个阶段都承担着不同的责任。通过这些阶段的协作，最终将一个模板字符串转换为一个高效的渲染函数。

## 1. 解析阶段（Parsing）

* 作用：将模板字符串解析为抽象语法树（AST）。这个阶段的目标是将模板的结构化信息提取出来，形成可操作的数据结构。

### 核心代码：

``` javascript
function parse(template) {
  const ast = {
    type: 'Root',
    children: []
  };

  const stack = [];
  let currentParent = ast;

  // 模拟解析过程（简单实现）
  template.replace(/<(\w+)>|<\/(\w+)>|{{(.*?)}}|([^<]+)/g, (match, startTag, endTag, interpolation, text) => {
    if (startTag) {
      const element = { type: 'Element', tag: startTag, children: [] };
      currentParent.children.push(element);
      stack.push(element);
      currentParent = element;
    } else if (endTag) {
      stack.pop();
      currentParent = stack[stack.length - 1];
    } else if (interpolation) {
      currentParent.children.push({ type: 'Interpolation', content: interpolation.trim() });
    } else if (text) {
      currentParent.children.push({ type: 'Text', content: text.trim() });
    }
  });

  return ast;
}

// 示例模板
const template = `<div>{{ message }}</div>`;
const ast = parse(template);
console.log(JSON.stringify(ast, null, 2));
```

### 输出的 AST：

``` json
{
  "type": "Root",
  "children": [
    {
      "type": "Element",
      "tag": "div",
      "children": [
        {
          "type": "Interpolation",
          "content": "message"
        }
      ]
    }
  ]
}
```

### 解析阶段总结：

* 通过正则表达式对模板进行扫描，构建出树形结构的 AST。
* 该 AST 主要包含元素节点（Element）、插值表达式节点（Interpolation）和文本节点（Text）。

## 2. 转换阶段（Transforming）

* 作用：对 AST 进行转换和优化。通过添加指令处理、响应式标记等，为代码生成阶段做好准备。

### 核心代码：

``` javascript
function transform(ast) {
  function traverse(node) {
    if (node.type === 'Interpolation') {
      // 转换插值表达式为具体函数调用
      node.content = `_ctx.${node.content}`;
    } else if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  }

  traverse(ast);
}

// 转换 AST
transform(ast);
console.log(JSON.stringify(ast, null, 2));
```

### 转换后的 AST：

``` json
{
  "type": "Root",
  "children": [
    {
      "type": "Element",
      "tag": "div",
      "children": [
        {
          "type": "Interpolation",
          "content": "_ctx.message"
        }
      ]
    }
  ]
}
```

### 转换阶段总结：

* 在此阶段，我们对 AST 进行了一些转化，比如将插值表达式（{{ message }}）转换为对应的访问语法（_ctx.message）。
* 通过这种方式，Vue 可以在渲染时将模板中的插值替换为响应式数据。

## 3. 生成阶段（Code Generation）

* 作用：将优化后的 AST 生成渲染函数的 JavaScript 代码。该渲染函数将被用于后续的虚拟 DOM 生成和更新。

### 核心代码：

``` javascript
function generate(ast) {
  function genNode(node) {
    if (node.type === 'Element') {
      const children = node.children.map(genNode).join(', ');
      return `_createElement('${node.tag}', null, [${children}])`;
    } else if (node.type === 'Interpolation') {
      return `_toDisplayString(${node.content})`;
    } else if (node.type === 'Text') {
      return JSON.stringify(node.content);
    }
  }

  const code = `return ${genNode(ast.children[0])}`;
  return new Function('_ctx', '_createElement', '_toDisplayString', code);
}

// 生成渲染函数
const render = generate(ast);
console.log(render.toString());
```

### 生成的渲染函数：

``` javascript
function render(_ctx, _createElement, _toDisplayString) {
  return _createElement('div', null, [_toDisplayString(_ctx.message)]);
}
```

### 生成阶段总结：

* 根据 AST，生成了一个渲染函数。该函数将 message 插值表达式映射到 _ctx.message，并通过 _createElement 和 _toDisplayString 创建虚拟 DOM。
* 该渲染函数是最终渲染视图的核心，它会在 Vue 的响应式系统中动态执行。

## 4. 执行阶段（Runtime Execution）

* 作用：执行生成的渲染函数，最终生成虚拟 DOM。

### 核心代码：

```javascript
function _createElement(tag, props, children) {
  return { tag, props, children };
}

function _toDisplayString(value) {
  return String(value);
}

// 示例数据
const context = { message: 'Hello, Vue 3!' };

// 执行渲染函数
const vnode = render(context, _createElement, _toDisplayString);
console.log(vnode);
```

### 虚拟 DOM 输出：

``` javascript
{
  "tag": "div",
  "props": null,
  "children": ["Hello, Vue 3!"]
}
```

### 执行阶段总结：

* 在执行阶段，通过传入上下文（_ctx）和辅助函数（_createElement 和 _toDisplayString）来执行渲染函数。
* 该渲染函数会返回一个虚拟 DOM 节点对象，这个对象将被 Vue 渲染引擎用于更新页面。

## 完整流程总结

* 解析阶段：将模板字符串解析为 AST，抽象出结构化的模板信息。
* 转换阶段：对 AST 进行转换，处理指令、插值等，标记响应式数据。
* 生成阶段：将 AST 转换为可执行的渲染函数，最终生成用于虚拟 DOM 创建的代码。
* 执行阶段：运行渲染函数，生成虚拟 DOM，并用于页面的更新和渲染。

通过这四个阶段，Vue 3 实现了高效的模板解析和渲染，结合响应式系统和虚拟 DOM，为前端开发提供了灵活且高效的视图更新机制。
