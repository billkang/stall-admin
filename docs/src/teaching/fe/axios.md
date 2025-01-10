# Axios 简介

## 1. Axios 设计思路
Axios 是一个基于 Promise 的 HTTP 客户端库，用于浏览器和 Node.js 中发送 HTTP 请求。

其设计思路主要体现在以下几个方面：

1. Promise API：Axios 使用 Promise 来处理异步请求，使得异步操作更加简洁和易于管理。
2. 请求和响应拦截器：Axios 提供了请求和响应拦截器，可以在请求发送前和响应接收后进行统一处理。这使得开发者可以轻松地添加认证头、处理错误、显示加载动画等。
3. 自动解析 JSON 数据：Axios 会自动解析 JSON 响应，而使用 Fetch 需要手动调用 response.json()。
4. 配置方便：可以在实例化 Axios 时设置默认配置，例如基 URL、超时时间、头信息等。
5. 请求数据格式化：自动将请求参数格式化为查询字符串，或在 POST 请求时自动序列化 JSON 数据。
6. 取消请求：Axios 支持取消请求，尤其在复杂的应用中（如 React、Vue 项目），避免不必要的请求。

## 2. Axios 插件化思想
Axios 的插件化思想主要体现在拦截器的使用上。拦截器允许开发者在请求发送前和响应接收后插入自定义逻辑，从而实现功能的扩展和复用。具体实现如下：

1. 请求拦截器：在每个请求发送前执行一些逻辑，例如添加鉴权 token 到请求头中，显示加载动画等。
2. 响应拦截器：在响应接收后执行一些逻辑，例如统一处理错误信息，解析响应数据等。

例如，可以创建一个插件来处理响应数据并弹窗显示：

```javascript
import type { AxiosResponseInterceptor } from '@/axios/types';

export const injectResponseAlert: AxiosResponseInterceptor = (response) => {
  const { data } = response;
  if (data) {
    alert(JSON.stringify(data));
  }
};
```

然后在响应拦截器中注册该插件：

``` javascript
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
在实际开发中，通常会对 Axios 进行封装，以便更好地管理项目和各个接口。以下是一个常见的封装示例：

1. 引入 Axios 相关依赖：

``` javascript
import axios from 'axios';
```

2. 创建 Axios 实例：

```javascript
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

3. 请求拦截设置：

``` javascript
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

4. 响应拦截设置：

``` javascript
service.interceptors.response.use(
  (response) => {
    return response.data; // 直接返回数据
  },
  (error) => {
    // 统一处理错误
    if (error.response.status === 401) {
      // 处理未授权
    }
    return Promise.reject(error);
  }
);
```

5. 封装 API 请求：

``` javascript
export function getUserData() {
  return service.get('/user/data');
}

export function postUserData(data) {
  return service.post('/user/data', data);
}
```

6. 集中管理 API：
创建一个 api.js 文件，集中管理所有 API 请求：

``` javascript
// api.js
import { getUserData, postUserData } from './service';

export const api = {
  getUserData,
  postUserData
};
```

7. 使用封装的 API：

```javascript
import { api } from './api';

api.getUserData().then(data => {
  console.log(data);
}).catch(error => {
  console.error(error);
});
```

## 总结
Axios 通过其强大的设计思路和插件化思想，提供了灵活且强大的 HTTP 请求功能。在实际开发中，通过封装 Axios，可以更好地管理项目中的 HTTP 请求，提高代码的可维护性和复用性。希望以上内容能帮助你在项目中更好地使用和封装 Axios。
