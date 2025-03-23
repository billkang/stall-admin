import type { Emitter } from 'mitt';

import axios from 'axios';
import mitt from 'mitt';

import { context } from './context';

export enum ENUM_REQUEST_EVENT {
  ERROR = 'error',
  LOADING = 'loading',
}

type Events = {
  error: any;
  loading: boolean;
};

export const emitter: Emitter<Events> = mitt<Events>();

export const request = axios.create();

function formatToken(token: null | string) {
  return token ? `Bearer ${token}` : null;
}

request.interceptors.request.use((config: any) => {
  emitter.emit(ENUM_REQUEST_EVENT.LOADING, true);

  let accessStore;
  try {
    const str = window.localStorage.getItem(
      context.CORE_ACCESS || 'stall-web-play-1.0.0-dev-core-access',
    );
    accessStore = JSON.parse(str || '');
  } catch {}

  if (accessStore) {
    const { accessToken } = accessStore;

    if (accessToken) {
      // jwt token
      config.headers.Authorization = formatToken(accessToken);
    }
  }

  return config;
});

request.interceptors.response.use(
  (response: { data: any; status: number }) => {
    emitter.emit(ENUM_REQUEST_EVENT.LOADING, false);

    const { data: responseData, status } = response;

    const { code, data: _data, error, message } = responseData;
    if (status >= 200 && status < 400 && code === 0) {
      return _data;
    }

    emitter.emit(ENUM_REQUEST_EVENT.ERROR, error || message);

    throw Object.assign({}, response, { response });
  },
  (error: any) => {
    emitter.emit(ENUM_REQUEST_EVENT.ERROR, error);
    emitter.emit(ENUM_REQUEST_EVENT.LOADING, false);

    return Promise.reject(error);
  },
);
