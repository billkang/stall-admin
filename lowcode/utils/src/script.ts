import { createDefer } from './create-defer';

/**
 * 通过加载js内容到页面，执行js
 * @param script 脚本内容
 */
export function evaluate(script: string) {
  const element = document.createElement('script');
  element.text = script;
  document.head.appendChild(element);
  document.head.removeChild(element);
}

/**
 * 通过加载url的方式，执行js
 * @param url
 * @returns
 */
export function load(url: string) {
  const element = document.createElement('script');

  const d = createDefer();
  function onload(e: any) {
    element.onload = null;
    element.onerror = null;

    if (e.type === 'load') {
      d.resolve();
    } else {
      d.reject();
    }
  }

  element.onload = onload;
  element.onerror = onload;
  element.src = url;
  element.async = false;

  document.head.appendChild(element);

  return d.promise();
}
