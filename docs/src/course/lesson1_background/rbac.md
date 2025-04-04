# RBAC权限管理入门指南

## 一、什么是RBAC？

RBAC（Role-Based Access Control，基于角色的访问控制）是一种常见的权限管理系统设计模式。它的核心思想是通过“角色”来分配权限，而不是直接将权限分配给用户。用户通过被分配角色间接获得权限，这样可以简化权限管理，提高系统的可维护性。

### RBAC的核心概念

1. **用户（User）**：系统中的最终使用者。
2. **角色（Role）**：一组权限的集合，例如“管理员”、“编辑”、“访客”等。
3. **权限（Permission）**：对系统资源（如页面、接口、按钮）的访问能力，例如“查看订单”、“编辑用户信息”等。

### RBAC的优势

- **简化权限管理**：通过角色管理权限，避免了直接为每个用户分配权限的复杂性。
- **灵活性高**：可以快速调整角色的权限，而不必逐个修改用户权限。
- **可扩展性好**：新增用户或调整权限时，只需分配或修改角色即可。

## 二、RBAC在前端、后端和数据库中的设计

### 1. 数据库设计

在RBAC系统中，数据库需要存储用户、角色和权限之间的关系。以下是常见的表结构设计：

#### 表结构

1. **用户表（users）**

   ```sql
   CREATE TABLE users (
     id INT PRIMARY KEY AUTO_INCREMENT,
     username VARCHAR(50) NOT NULL UNIQUE,
     password VARCHAR(255) NOT NULL,
     email VARCHAR(100) NOT NULL UNIQUE
   );
   ```

2. **角色表（roles）**

   ```sql
   CREATE TABLE roles (
     id INT PRIMARY KEY AUTO_INCREMENT,
     name VARCHAR(50) NOT NULL UNIQUE,
     description VARCHAR(255)
   );
   ```

3. **权限表（permissions）**

   ```sql
   CREATE TABLE permissions (
     id INT PRIMARY KEY AUTO_INCREMENT,
     name VARCHAR(50) NOT NULL UNIQUE,
     description VARCHAR(255)
   );
   ```

4. **用户-角色关联表（user_roles）**

   ```sql
   CREATE TABLE user_roles (
     user_id INT NOT NULL,
     role_id INT NOT NULL,
     PRIMARY KEY (user_id, role_id),
     FOREIGN KEY (user_id) REFERENCES users(id),
     FOREIGN KEY (role_id) REFERENCES roles(id)
   );
   ```

5. **角色-权限关联表（role_permissions）**

   ```sql
   CREATE TABLE role_permissions (
     role_id INT NOT NULL,
     permission_id INT NOT NULL,
     PRIMARY KEY (role_id, permission_id),
     FOREIGN KEY (role_id) REFERENCES roles(id),
     FOREIGN KEY (permission_id) REFERENCES permissions(id)
   );
   ```

#### 示例数据

- **用户表**

  | id | username | password | email          |
  |----|----------|----------|----------------|
  | 1  | admin    | ...      | <admin@example.com> |
  | 2  | editor   | ...      | <editor@example.com> |

- **角色表**

  | id | name     | description       |
  |----|----------|-------------------|
  | 1  | admin    | 系统管理员        |
  | 2  | editor   | 内容编辑          |

- **权限表**

  | id | name          | description       |
  |----|---------------|-------------------|
  | 1  | view_dashboard | 查看仪表盘        |
  | 2  | edit_content  | 编辑内容          |
  | 3  | manage_users  | 管理用户          |

- **用户-角色关联表**

  | user_id | role_id |
  |---------|---------|
  | 1       | 1       |
  | 2       | 2       |

- **角色-权限关联表**

  | role_id | permission_id |
  |---------|---------------|
  | 1       | 1             |
  | 1       | 2             |
  | 1       | 3             |
  | 2       | 1             |
  | 2       | 2             |

### 2. 后端设计（Node.js）

后端负责处理权限验证和鉴权逻辑。以下是基于Node.js的实现步骤：

#### 1. 用户登录与鉴权

- 用户登录时，验证用户名和密码。
- 生成JWT（JSON Web Token）作为用户的登录凭证。
- 将用户的权限信息存储在JWT中，以便后续验证。

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Role, Permission } = require('./models');

// 用户登录
async function login(req, res) {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(401).json({ message: '用户不存在' });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ message: '密码错误' });

  // 获取用户的角色和权限
  const roles = await user.getRoles();
  const permissions = await Promise.all(
    roles.map(role => role.getPermissions())
  );
  const permissionNames = permissions.flat().map(p => p.name);

  // 生成JWT
  const token = jwt.sign(
    { userId: user.id, permissions: permissionNames },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
}
```

#### 2. 鉴权中间件

- 创建一个中间件，用于验证用户是否具有访问某个接口的权限。

```javascript
function authMiddleware(requiredPermission) {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: '未提供令牌' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // 检查用户是否有所需权限
      if (!req.user.permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: '无权访问此资源' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: '令牌无效或已过期' });
    }
  };
}

// 使用中间件保护路由
app.get('/dashboard', authMiddleware('view_dashboard'), (req, res) => {
  res.json({ message: '仪表盘数据' });
});
```

### 3. 前端设计（Vue 3）

前端负责根据用户的权限动态显示或隐藏页面、接口和页面元素。

#### 1. 获取用户权限

- 在用户登录后，从JWT中解析权限信息并存储到全局状态（如Pinia）中。

```javascript
// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    permissions: []
  }),
  actions: {
    setToken(token) {
      this.token = token;
      const decoded = this.parseToken(token);
      this.permissions = decoded.permissions || [];
    },
    parseToken(token) {
      return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    },
    hasPermission(permission) {
      return this.permissions.includes(permission);
    }
  }
});
```

#### 2. 页面级鉴权

- 使用路由守卫，根据用户权限动态显示或隐藏页面。

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresPermission: 'view_dashboard' }
    },
    {
      path: '/edit',
      name: 'edit',
      component: () => import('@/views/Edit.vue'),
      meta: { requiresPermission: 'edit_content' }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const requiredPermission = to.meta.requiresPermission;

  if (requiredPermission && !userStore.hasPermission(requiredPermission)) {
    next('/login');
  } else {
    next();
  }
});

export default router;
```

#### 3. 接口级鉴权（封装到axios中）

- 创建一个axios实例，并在请求拦截器中检查用户权限。

```javascript
// api/axios.js
import axios from 'axios';
import { useUserStore } from '@/stores/user';

const api = axios.create({
  baseURL: '/api'
});

// 请求拦截器
api.interceptors.request.use(config => {
  const userStore = useUserStore();
  const token = userStore.token;

  // 添加Authorization头
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器
api.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response.status === 403) {
    alert('无权访问此资源');
  }
  return Promise.reject(error);
});

export default api;
```

#### 4. 页面元素级鉴权（封装到指令中）

- 创建一个自定义指令`v-permission`，用于动态显示或隐藏页面元素。

```javascript
// directives/permission.js
import { useUserStore } from '@/stores/user';

export default {
  mounted(el, binding) {
    const userStore = useUserStore();
    const requiredPermissions = Array.isArray(binding.value)
      ? binding.value
      : [binding.value];

    // 检查是否具有至少一个权限
    const hasPermission = requiredPermissions.some(permission =>
      userStore.hasPermission(permission)
    );

    if (!hasPermission) {
      el.style.display = 'none';
    }
  },
  updated(el, binding) {
    this.mounted(el, binding);
  }
};

// 在主应用中注册指令
import { createApp } from 'vue';
import App from './App.vue';
import permissionDirective from './directives/permission';

const app = createApp(App);
app.directive('permission', permissionDirective);
app.mount('#app');
```

#### 5. 使用自定义指令

- 在组件中使用`v-permission`指令来控制元素的显示。

```vue
<!-- Dashboard.vue -->
<template>
  <div>
    <h1>仪表盘</h1>
    <button v-permission="['edit_content']" @click="editContent">
      编辑内容
    </button>
    <button v-permission="['manage_users']" @click="manageUsers">
      管理用户
    </button>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

function editContent() {
  // 编辑内容逻辑
}

function manageUsers() {
  // 管理用户逻辑
}
</script>
```

## 三、总结

通过RBAC权限管理系统，我们可以有效地管理用户权限，确保系统的安全性和可维护性。以下是关键点总结：

1. **数据库设计**：通过用户、角色和权限的多表关联，实现灵活的权限管理。
2. **后端设计**：通过JWT实现用户登录和鉴权，确保接口访问的安全性。
3. **前端设计**：
   - **页面级鉴权**：使用路由守卫动态显示或隐藏页面。
   - **接口级鉴权**：封装到axios拦截器中，统一管理接口权限。
   - **页面元素级鉴权**：通过自定义指令`v-permission`动态显示或隐藏页面元素。
