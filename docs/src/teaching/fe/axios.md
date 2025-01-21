# Axios 深入解析：环境兼容性及适配器实现

## 1. Axios 设计思路
Axios 是一个基于 Promise 的 HTTP 客户端库，用于浏览器和 Node.js 中发送 HTTP 请求。它通过以下特性提供了一个强大且灵活的解决方案：

- **Promise API**：使用 Promise 来处理异步请求，简化了代码逻辑。
- **请求和响应拦截器**：可以在请求发送前和响应接收后进行统一处理，如添加认证头、处理错误等。
- **自动解析 JSON 数据**：默认情况下会自动解析 JSON 响应。
- **配置方便**：允许设置全局或局部的默认配置项。
- **请求数据格式化**：支持自动序列化请求体为 JSON 或查询字符串。
- **取消请求**：提供了取消请求的功能。

## 2. Axios 插件化思想
Axios 的插件化思想主要体现在其拦截器机制上，允许开发者在不修改核心逻辑的前提下扩展功能。例如，可以通过创建自定义插件来处理响应数据或显示加载动画。

```javascript
import type { AxiosResponseInterceptor } from '@/axios/types';

export const injectResponseAlert: AxiosResponseInterceptor = (response) => {
  const { data } = response;
  if (data) {
    alert(JSON.stringify(data));
  }
};

instance.interceptors.response.use(
  (response) => {
    injectResponseAlert(response);
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

## 3. 实际开发中的使用与封装
为了提高项目的可维护性和复用性，通常会对 Axios 进行进一步封装，以集中管理配置和接口调用。

### 创建 Axios 实例并设置默认配置

```javascript
import axios from 'axios';

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### 配置请求和响应拦截器

```javascript
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

service.interceptors.response.use(
  response => response.data,
  error => {
    // 统一处理错误
    if (error.response.status === 401) {
      // 处理未授权
    }
    return Promise.reject(error);
  }
);
```

### 封装 API 请求函数

```javascript
export function getUserData() {
  return service.get('/user/data');
}

export function postUserData(data) {
  return service.post('/user/data', data);
}
```

### 集中管理所有 API

```javascript
// api.js
import { getUserData, postUserData } from './service';

export const api = {
  getUserData,
  postUserData
};
```

### 使用封装好的 API

```javascript
import { api } from './api';

api.getUserData().then(data => {
  console.log(data);
}).catch(error => {
  console.error(error);
});
```

## 4. Axios 的环境兼容性及适配器实现

### 适配器模式的应用

Axios 使用适配器模式来抽象不同环境下的 HTTP 请求实现。这意味着无论是浏览器还是 Node.js，都可以通过相同的接口来进行网络请求，而具体的实现细节则由适配器负责处理。这种模式提高了代码的可移植性和复用性。

#### 浏览器端适配器 (`adapters/xhr`)

在浏览器环境中，Axios 使用 `XMLHttpRequest` 或者 `fetch` API（如果浏览器支持）来发送 HTTP 请求。下面是一个简化的 `xhr` 适配器实现示例：

```javascript
// adapters/xhr.js
function xhrAdapter(config) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(config.method.toUpperCase(), config.url, true);

    // 设置请求头
    Object.keys(config.headers).forEach(key => {
      if (config.headers[key] !== null) {
        request.setRequestHeader(key, config.headers[key]);
      }
    });

    // 发送请求
    request.send(config.data);

    // 监听状态变化
    request.onreadystatechange = () => {
      if (request.readyState !== 4) {
        return;
      }

      if (request.status >= 200 && request.status < 300) {
        resolve({
          data: request.responseText,
          status: request.status,
          statusText: request.statusText,
          headers: parseHeaders(request.getAllResponseHeaders()),
          config: config,
          request: request
        });
      } else {
        reject(createError(
          `Request failed with status code ${request.status}`,
          config,
          null,
          request
        ));
      }
    };

    // 错误处理
    request.onerror = () => {
      reject(createError('Network Error', config, null, request));
    };
  });
}

// 解析响应头
function parseHeaders(headersString) {
  const headers = {};
  if (!headersString) {
    return headers;
  }
  headersString.split('\r\n').forEach(line => {
    let [key, val] = line.split(': ');
    if (key) {
      headers[key.toLowerCase()] = val;
    }
  });
  return headers;
}

// 创建错误对象
function createError(message, config, code, request) {
  const error = new Error(message);
  error.config = config;
  error.code = code;
  error.request = request;
  return error;
}

export default xhrAdapter;
```

#### Node.js 端适配器 (`adapters/http`)

在 Node.js 环境中，Axios 使用 Node.js 内置的 `http` 或 `https` 模块来发起请求。这里展示一个简化版的 `http` 适配器实现：

```javascript
// adapters/http.js
const http = require('http');
const https = require('https');

function httpAdapter(config) {
  return new Promise((resolve, reject) => {
    const lib = /^https/.test(config.url) ? https : http;
    const request = lib.request(config, response => {
      let data = '';

      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        resolve({
          data: data,
          status: response.statusCode,
          statusText: response.statusMessage,
          headers: response.headers,
          config: config,
          request: request
        });
      });
    });

    request.on('error', error => {
      reject(error);
    });

    if (config.method.toUpperCase() !== 'GET') {
      request.write(config.data);
    }

    request.end();
  });
}

export default httpAdapter;
```

### 动态选择适配器

根据运行时环境动态选择适配器是 Axios 设计的一个关键点。这通过检查当前执行环境来完成，并返回适当的适配器实例：

```javascript
function createAdapter() {
  if (typeof XMLHttpRequest !== 'undefined') {
    // 浏览器环境
    return require('./adapters/xhr'); // 使用 XMLHttpRequest
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // Node.js 环境
    return require('./adapters/http'); // 使用 http 模块
  }
}

// Axios 构造函数的一部分
function Axios(config) {
  this.defaults = config;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };

  // 动态选择适配器
  this.adapter = createAdapter();
}

// 发送请求的方法
Axios.prototype.request = function request(config) {
  // 处理配置...
  
  // 执行适配器
  return this.adapter(config).then(function onAdapterResolution(response) {
    // 处理响应...
    return response;
  }, function onAdapterRejection(reason) {
    // 处理错误...
    return Promise.reject(reason);
  });
};
```

### 设计模式总结

- **适配器模式**：用于抽象不同环境下的 HTTP 请求实现。
- **工厂模式**：根据当前环境动态创建适当的 HTTP 请求实例。
- **装饰器模式**：通过拦截器机制为请求和响应添加额外功能。
- **单例模式**：创建全局 Axios 实例，默认配置适用于所有请求。

综上所述，Axios 通过强大的设计模式和技术实现，确保了其在不同环境下的高效工作，并提供了简单易用的 API 接口。希望这篇文档能帮助你在项目中更好地理解和运用 Axios。
