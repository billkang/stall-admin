/**
 * 将中划线连接的字符串转化为小驼峰命名法
 *
 * @example
 *
 * const res = camelCase('user-name'); // userName
 *
 * @param str - 被转换的字符串
 */
export function camelCase(str: string): string {
  if (!str) return str;
  return str.replace(/-[a-zA-Z]/g, c => {
    return c.charAt(1).toLocaleUpperCase();
  });
}
