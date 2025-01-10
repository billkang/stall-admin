# axios的封装

封装axios的代码位于项目根目录下面的 “/packages/effects/request”中。

## request-client 讲解

RequestClient 类，用于封装 Axios 的请求功能，并提供了请求拦截器、文件上传和下载等扩展功能。

以下是详细的分析和设计思路总结：

### 1. 导入依赖
``` javascript
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
} from 'axios';

import type { RequestClientOptions } from './types';

import { bindMethods, merge } from '@stall/utils';

import axios from 'axios';

import { FileDownloader } from './modules/downloader';
import { InterceptorManager } from './modules/interceptor';
import { FileUploader } from './modules/uploader';
```

* Axios 相关类型：从 axios 导入了 AxiosInstance、AxiosRequestConfig、AxiosResponse 和 CreateAxiosDefaults 类型，用于类型注解。
* 自定义类型：从 ./types 导入了 RequestClientOptions 类型，用于配置 RequestClient。
* 工具函数：从 @stall/utils 导入了 bindMethods 和 merge 函数，用于绑定方法和合并配置。
* 模块：从 ./modules 导入了 FileDownloader、InterceptorManager 和 FileUploader 模块，用于文件下载、拦截器管理和文件上传。

### 2. RequestClient 类定义
``` javascript
class RequestClient {
  public addRequestInterceptor: InterceptorManager['addRequestInterceptor'];
  public addResponseInterceptor: InterceptorManager['addResponseInterceptor'];
  public download: FileDownloader['download'];
  public isRefreshing = false;
  public refreshTokenQueue: ((token: string) => void)[] = [];
  public upload: FileUploader['upload'];
  private readonly instance: AxiosInstance;

  constructor(options: RequestClientOptions = {}) {
    const defaultConfig: CreateAxiosDefaults = {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      timeout: 10_000,
    };
    const { ...axiosConfig } = options;
    const requestConfig = merge(axiosConfig, defaultConfig);
    this.instance = axios.create(requestConfig);

    bindMethods(this);

    const interceptorManager = new InterceptorManager(this.instance);
    this.addRequestInterceptor = interceptorManager.addRequestInterceptor.bind(interceptorManager);
    this.addResponseInterceptor = interceptorManager.addResponseInterceptor.bind(interceptorManager);

    const fileUploader = new FileUploader(this);
    this.upload = fileUploader.upload.bind(fileUploader);

    const fileDownloader = new FileDownloader(this);
    this.download = fileDownloader.download.bind(fileDownloader);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, data, method: 'POST' });
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, data, method: 'PUT' });
  }

  public async request<T>(url: string, config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance({
        url,
        ...config,
      });
      return response as T;
    } catch (error: any) {
      throw error.response ? error.response.data : error;
    }
  }
}
```

### 3. 设计思路

1). 配置管理：
* 默认配置：定义了默认的 Axios 配置，包括请求头和超时时间。
* 合并配置：通过 merge 函数将传入的配置与默认配置合并，确保配置的灵活性和可扩展性。

2). 方法绑定：
* bindMethods：使用 bindMethods 函数将类方法绑定到实例上，确保方法中的 this 指向正确。

3). 拦截器管理：
* InterceptorManager：实例化 InterceptorManager，并绑定 addRequestInterceptor 和 addResponseInterceptor 方法，方便外部添加请求和响应拦截器。

4). 文件上传和下载：
* FileUploader：实例化 FileUploader，并绑定 upload 方法，方便文件上传。
* FileDownloader：实例化 FileDownloader，并绑定 download 方法，方便文件下载。

5). 请求方法：
* 通用请求方法：定义了 request 方法，用于发送通用的 HTTP 请求。该方法支持泛型，可以指定返回数据的类型。
* 特定请求方法：定义了 delete、get、post 和 put 方法，这些方法调用 request 方法，并设置相应的 HTTP 方法。

6). 错误处理：
* 请求方法：在 request 方法中，捕获并处理请求错误。如果错误响应中有 response 对象，返回 response.data，否则返回错误对象。

### 4. 总结
RequestClient 类通过封装 Axios，提供了一个灵活且功能丰富的 HTTP 请求客户端。它不仅支持常见的 HTTP 请求方法，还提供了请求和响应拦截器、文件上传和下载功能。通过合并配置和方法绑定，确保了类的灵活性和可扩展性。这种设计思路使得 RequestClient 可以在实际开发中方便地管理和扩展 HTTP 请求功能。


## preset-interceptors 讲解

这段代码定义了两个响应拦截器配置函数：authenticateResponseInterceptor 和 errorMessageResponseInterceptor。这些拦截器用于处理 HTTP 请求的响应，特别是在处理认证和错误信息方面。

以下是对这两个拦截器的详细解释和设计思路总结：

### 1. 导入依赖
``` javascript
import type { RequestClient } from './request-client';
import type { MakeErrorMessageFn, ResponseInterceptorConfig } from './types';

import { $t } from '@stall/locales';

import axios from 'axios';
```

* RequestClient：从 ./request-client 导入 RequestClient 类型，用于类型注解。
* MakeErrorMessageFn 和 ResponseInterceptorConfig：从 ./types 导入 MakeErrorMessageFn 和 ResponseInterceptorConfig 类型，用于定义错误处理函数和响应拦截器配置。
* $t：从 @stall/locales 导入 $t 函数，用于国际化处理错误信息。
* axios：导入 axios 库，用于检查请求是否被取消。

### 2. authenticateResponseInterceptor 拦截器
``` javascript
export const authenticateResponseInterceptor = ({
  client,
  doReAuthenticate,
  doRefreshToken,
  enableRefreshToken,
  formatToken,
}: {
  client: RequestClient;
  doReAuthenticate: () => Promise<void>;
  doRefreshToken: () => Promise<string>;
  enableRefreshToken: boolean;
  formatToken: (token: string) => null | string;
}): ResponseInterceptorConfig => {
  return {
    rejected: async (error) => {
      const { config, response } = error;
      // 如果不是 401 错误，直接抛出异常
      if (response?.status !== 401) {
        throw error;
      }
      // 判断是否启用了 refreshToken 功能
      // 如果没有启用或者已经是重试请求了，直接跳转到重新登录
      if (!enableRefreshToken || config.__isRetryRequest) {
        await doReAuthenticate();
        throw error;
      }
      // 如果正在刷新 token，则将请求加入队列，等待刷新完成
      if (client.isRefreshing) {
        return new Promise((resolve) => {
          client.refreshTokenQueue.push((newToken: string) => {
            config.headers.Authorization = formatToken(newToken);
            resolve(client.request(config.url, { ...config }));
          });
        });
      }

      // 标记开始刷新 token
      client.isRefreshing = true;
      // 标记当前请求为重试请求，避免无限循环
      config.__isRetryRequest = true;

      try {
        const newToken = await doRefreshToken();

        // 处理队列中的请求
        client.refreshTokenQueue.forEach((callback) => callback(newToken));
        // 清空队列
        client.refreshTokenQueue = [];

        return client.request(error.config.url, { ...error.config });
      } catch (refreshError) {
        // 如果刷新 token 失败，处理错误（如强制登出或跳转登录页面）
        client.refreshTokenQueue.forEach((callback) => callback(''));
        client.refreshTokenQueue = [];
        console.error('Refresh token failed, please login again.');
        await doReAuthenticate();

        throw refreshError;
      } finally {
        client.isRefreshing = false;
      }
    },
  };
};
```

#### 设计思路：

1). 参数：
* client：RequestClient 实例，用于发送请求。
* doReAuthenticate：重新认证的函数，用于处理认证失败的情况。
* doRefreshToken：刷新 token 的函数，用于获取新的认证 token。
* enableRefreshToken：布尔值，表示是否启用 token 刷新功能。
* formatToken：格式化 token 的函数，用于将 token 格式化为正确的格式。

2). 处理 401 错误：
* 如果响应状态码不是 401，直接抛出异常。
* 如果没有启用 token 刷新功能或已经是重试请求，调用 doReAuthenticate 重新认证并抛出异常。

3).处理 token 刷新：
* 如果正在刷新 token，将当前请求加入队列，等待刷新完成。
* 标记开始刷新 token，并将当前请求标记为重试请求。
* 调用 doRefreshToken 获取新的 token。
* 处理队列中的请求，将新的 token 设置到请求头中，并重新发送请求。
* 如果刷新 token 失败，处理错误（如强制登出或跳转登录页面）。

### 3. errorMessageResponseInterceptor 拦截器
``` javascript
export const errorMessageResponseInterceptor = (
  makeErrorMessage?: MakeErrorMessageFn,
): ResponseInterceptorConfig => {
  return {
    rejected: (error: any) => {
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }

      const err: string = error?.toString?.() ?? '';
      let errMsg = '';
      if (err?.includes('Network Error')) {
        errMsg = $t('ui.fallback.http.networkError');
      } else if (error?.message?.includes?.('timeout')) {
        errMsg = $t('ui.fallback.http.requestTimeout');
      }
      if (errMsg) {
        makeErrorMessage?.(errMsg, error);
        return Promise.reject(error);
      }

      let errorMessage = '';
      const status = error?.response?.status;

      switch (status) {
        case 400: {
          errorMessage = $t('ui.fallback.http.badRequest');
          break;
        }
        case 401: {
          errorMessage = $t('ui.fallback.http.unauthorized');
          break;
        }
        case 403: {
          errorMessage = $t('ui.fallback.http.forbidden');
          break;
        }
        case 404: {
          errorMessage = $t('ui.fallback.http.notFound');
          break;
        }
        case 408: {
          errorMessage = $t('ui.fallback.http.requestTimeout');
          break;
        }
        default: {
          errorMessage = $t('ui.fallback.http.internalServerError');
        }
      }
      makeErrorMessage?.(errorMessage, error);
      return Promise.reject(error);
    },
  };
};
```

#### 设计思路：

1). 参数：
* makeErrorMessage：错误处理函数，用于处理和显示错误信息。

2). 处理请求取消：
* 如果请求被取消，直接返回被拒绝的 Promise。

3). 处理网络错误和超时：
* 检查错误信息，如果是网络错误或超时，使用 $t 函数获取相应的国际化错误信息，并调用 makeErrorMessage 处理错误。

4). 处理 HTTP 状态码：
* 根据 HTTP 状态码，使用 $t 函数获取相应的国际化错误信息，并调用 makeErrorMessage 处理错误。
* 支持的状态码包括 400、401、403、404、408 和默认的 500 错误。

### 4. 总结
这两个拦截器的设计思路如下：

1). authenticateResponseInterceptor：
* 认证处理：处理 401 错误，支持 token 刷新和重新认证。
* 队列管理：在 token 刷新期间，将请求加入队列，等待刷新完成后再重新发送。
* 错误处理：处理 token 刷新失败的情况，强制登出或跳转登录页面。

2). errorMessageResponseInterceptor：
* 请求取消：处理被取消的请求。
* 网络错误和超时：处理网络错误和请求超时，显示相应的错误信息。
* HTTP 状态码：根据 HTTP 状态码，显示相应的错误信息。

通过这两个拦截器，可以有效地处理认证和错误信息，提升用户体验和系统的健壮性。
