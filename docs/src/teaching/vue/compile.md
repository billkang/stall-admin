# 手把手理解 Vue3 模板编译原理

本文将通过面包店做蛋糕的比喻，带你轻松掌握 Vue3 模板编译的四个关键步骤。即使你是刚入门的前端开发者，也能通过代码示例和图文解析理解整个过程。

---

## 前置知识小贴士

- **模板是什么**：类似 HTML 的代码片段，如 `<div>{{ message }}</div>`
- **虚拟 DOM**：用 JavaScript 对象描述页面结构
- **AST（抽象语法树）**：类似乐高图纸的结构化数据表示

---

## 整体流程比喻

想象制作蛋糕的四个步骤：

1. **解析阶段**：阅读食谱（将模板解析为结构化的AST）
2. **转换阶段**：调整配方（优化AST结构）
3. **代码生成**：写出详细步骤（生成可执行的JS代码）
4. **烘烤执行**：实际制作蛋糕（运行代码生成页面）

---

## 一、解析阶段（Parsing）—— 读懂模板结构

### 核心任务

将模板字符串转换为树形结构（AST），就像把食谱文字转成结构化的步骤清单

### 代码实现

```javascript
// 初始化工具
let currentParent;
const stack = [];
const ast = { type: 'Root', children: [] };
currentParent = ast;

function parse(template) {
  // 使用更健壮的正则（处理属性和嵌套）
  const regex = /<(\w+)([^>]*)>|<\/\w+>|{{(.*?)}}|([^<]+)/g;

  template.replace(regex, (match, startTag, attrs, interpolation, text) => {
    if (startTag) {
      const element = {
        type: 'Element',
        tag: startTag,
        attrs: parseAttrs(attrs), // 新增属性解析
        children: []
      };
      currentParent.children.push(element);
      stack.push(element);
      currentParent = element;
    } else if (match.startsWith('</')) {
      stack.pop();
      currentParent = stack[stack.length - 1] || ast;
    } else if (interpolation) {
      currentParent.children.push({
        type: 'Interpolation',
        content: interpolation.trim()
      });
    } else if (text?.trim()) {
      currentParent.children.push({
        type: 'Text',
        content: text.trim()
      });
    }
  });

  return ast;
}

// 辅助函数：解析属性
function parseAttrs(attrsStr) {
  return attrsStr.split(/\s+/)
    .filter(attr => attr)
    .map(attr => {
      const [name, value] = attr.split('=');
      return { name, value: value?.replace(/['"]/g, '') };
    });
}

// 测试复杂模板
const template = `
  <div class="container">
    <p>欢迎您，{{ userName }}！</p>
    <button @click="handleClick">点击</button>
  </div>
`;
console.log(parse(template));
```

### AST 输出示例

```json
{
  "type": "Root",
  "children": [{
    "type": "Element",
    "tag": "div",
    "attrs": [{ "name": "class", "value": "container" }],
    "children": [
      {
        "type": "Element",
        "tag": "p",
        "attrs": [],
        "children": [
          { "type": "Text", "content": "欢迎您，" },
          { "type": "Interpolation", "content": "userName" },
          { "type": "Text", "content": "！" }
        ]
      },
      {
        "type": "Element",
        "tag": "button",
        "attrs": [{ "name": "@click", "value": "handleClick" }],
        "children": [{ "type": "Text", "content": "点击" }]
      }
    ]
  }]
}
```

### 新手常见问题

1. **Q**: 为什么需要 AST？
   **A**: 就像建筑需要蓝图，AST 帮助程序理解模板的层级结构

2. **Q**: 正则表达式如何处理复杂情况？
   **A**: 实际 Vue 编译器使用状态机解析，这里用正则简化演示

---

## 二、转换阶段（Transforming）—— 优化模板结构

### 核心任务

给 AST 添加附加信息，就像给蛋糕配方添加制作小贴士

```javascript
function transform(ast) {
  // 上下文处理
  const context = {
    helpers: new Set(['toDisplayString']),
    currentNode: null
  };

  function traverse(node) {
    context.currentNode = node;

    // 处理插值表达式
    if (node.type === 'Interpolation') {
      node.content = `_ctx.${node.content}`;
    }

    // 处理事件指令
    if (node.type === 'Element') {
      node.props = node.attrs.filter(attr => {
        if (attr.name.startsWith('@')) {
          node.events = node.events || [];
          node.events.push({
            name: attr.name.slice(1),
            handler: attr.value
          });
          return false;
        }
        return true;
      });
    }

    // 递归处理子节点
    if (node.children) {
      node.children.forEach(child => traverse(child));
    }

    context.currentNode = null;
  }

  traverse(ast);

  return {
    ast,
    helpers: Array.from(context.helpers)
  };
}

// 执行转换
const transformed = transform(ast);
console.log(transformed.ast);
```

### 转换后变化

1. 插值表达式添加 `_ctx.` 前缀
2. 事件指令被提取到 `events` 属性
3. 收集需要的辅助函数

---

## 三、代码生成（Code Generation）—— 编写制作步骤

### 核心任务

把优化后的 AST 转换为可执行的渲染函数

```javascript
function generate(transformed) {
  const { ast, helpers } = transformed;

  const code = `
    ${helpers.map(h => `const ${h} = Vue.${h}`).join('\n')}

    return function render(_ctx) {
      return ${genNode(ast.children[0])}
    }
  `;

  function genNode(node) {
    switch (node.type) {
      case 'Element':
        return `h('${node.tag}', {${genProps(node)}}, [${node.children.map(genNode).join(', ')}])`;
      case 'Interpolation':
        return `toDisplayString(${node.content})`;
      case 'Text':
        return `"${node.content}"`;
    }
  }

  function genProps(node) {
    const props = [];
    if (node.attrs) {
      props.push(...node.attrs.map(attr =>
        `${JSON.stringify(attr.name)}: ${JSON.stringify(attr.value)}`
      ));
    }
    if (node.events) {
      props.push(...node.events.map(event =>
        `on${event.name[0].toUpperCase() + event.name.slice(1)}: ${event.handler}`
      ));
    }
    return props.join(', ');
  }

  return code;
}

// 生成代码
const generatedCode = generate(transformed);
console.log(generatedCode);
```

### 生成的渲染函数

```javascript
const toDisplayString = Vue.toDisplayString;

return function render(_ctx) {
  return h('div', { "class": "container" }, [
    h('p', {}, [
      "欢迎您，",
      toDisplayString(_ctx.userName),
      "！"
    ]),
    h('button', {
      onClick: handleClick
    }, [
      "点击"
    ])
  ])
}
```

---

## 四、运行时执行（Runtime Execution）—— 制作最终蛋糕

### 核心流程

```javascript
// Vue 的运行时帮助函数
const h = Vue.h;
const toDisplayString = Vue.toDisplayString;

// 生成的渲染函数
function render(_ctx) {
  // ...上面的生成代码
}

// 组件实例
const app = {
  setup() {
    const userName = Vue.ref('张三');
    const handleClick = () => alert('点击事件');
    return { userName, handleClick };
  },
  render
};

// 挂载到页面
Vue.createApp(app).mount('#app');
```

### 最终虚拟 DOM

```javascript
{
  tag: 'div',
  props: { class: 'container' },
  children: [
    {
      tag: 'p',
      children: ['欢迎您，', '张三', '！']
    },
    {
      tag: 'button',
      props: { onClick: handleClick },
      children: ['点击']
    }
  ]
}
```
