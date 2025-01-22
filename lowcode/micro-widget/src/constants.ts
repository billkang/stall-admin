export const GLOBAL_CACHED_KEY =
  'window,self,globalThis,document,Document,Array,Object,String,Boolean,Math,Number,Symbol,Date,Function,Proxy,WeakMap,WeakSet,Set,Map,Reflect,Element,Node,RegExp,Error,TypeError,JSON,isNaN,parseFloat,parseInt,performance,console,decodeURI,encodeURI,decodeURIComponent,encodeURIComponent,navigator,undefined,location,history';

export const SCOPE_WINDOW_ON_EVENT = ['onpopstate', 'onhashchange', 'onload', 'onbeforeunload', 'onunload'];

export enum WIDGET_STATUS {
  CREATED = 'created',
  LOADING = 'loading',
  LOAD_FAILED = 'load_failed',
  MOUNTING = 'mounting',
  MOUNTED = 'mounted',
  UNMOUNT = 'unmount',
}
