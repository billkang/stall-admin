import mitt, { type Emitter } from 'mitt';
import axios from 'axios';
import { context } from './context';

export enum ENUM_REQUEST_EVENT {
  LOADING = 'loading',
  ERROR = 'error',
}

type Events = {
  loading: boolean;
  error: any;
};

export const emitter: Emitter<Events> = mitt<Events>();

export const request = axios.create();

request.interceptors.request.use(function (config: { headers: { Authorization: any; tenantId: any; domainCode: any; }; }) {
  emitter.emit(ENUM_REQUEST_EVENT.LOADING, true);

  let appUser;
  try {
    const str = window.localStorage.getItem(context.APP_USER || 'stall_BASIC___APP_USER');
    appUser = JSON.parse(str || '');
  } catch {}

  if (appUser) {
    const { accessToken, userInfo } = appUser;

    if (accessToken) {
      // jwt token
      config.headers.Authorization = accessToken;

      if (userInfo) {
        config.headers.tenantId = userInfo.tenantId;
        config.headers.domainCode = userInfo.domainCode;
      }
    }
  }

  return config;
});

request.interceptors.response.use(
  function (res: { data: any; }) {
    emitter.emit(ENUM_REQUEST_EVENT.LOADING, false);

    if (!res) {
      return;
    }

    const { data } = res;

    if (!data) {
      emitter.emit(ENUM_REQUEST_EVENT.ERROR, 'no data');
      throw new Error('error');
    }

    // 用于处理文件下载
    if (
      ['application/octet-stream', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(
        data.type,
      )
    ) {
      return res;
    }

    //  这里 code，result，message为 后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
    const { data: _data, errCode, errMessage, pageIndex, pageSize, success, totalCount, traceId } = data as any;

    let result;
    // 区分 分页接口和非分页接口的返回数据类型格式
    if (totalCount !== null && totalCount !== undefined) {
      result = {
        items: _data,
        traceId,
        pageIndex,
        pageSize,
        totalCount,
      };
    } else {
      result = _data;
    }

    const hasSuccess = data && !!success;
    if (hasSuccess) {
      return result || null;
    }

    // 在此处根据自己项目的实际情况对不同的code执行不同的操作
    // 如果不希望中断当前请求，请return数据，否则直接抛出异常即可
    let timeoutMsg = '';
    switch (errCode) {
      default:
        if (errMessage) {
          timeoutMsg = errMessage;
        } else {
          timeoutMsg = 'error';
        }
    }

    emitter.emit(ENUM_REQUEST_EVENT.ERROR, timeoutMsg);

    throw new Error(timeoutMsg);
  },
  function (error: any) {
    emitter.emit(ENUM_REQUEST_EVENT.ERROR, error);
    emitter.emit(ENUM_REQUEST_EVENT.LOADING, false);

    return Promise.reject(error);
  },
);
