/**
 * 递归检查节点或其父节点是否包含指定的 CSS 类名。
 * @param node 要检查的节点
 * @param className 要查找的 CSS 类名
 * @returns 如果找到类名或节点不存在则返回 true，否则返回 false
 */
export function recursiveCheckNodeClass(
  node: Node & { classList: any }, // 节点类型，确保其有 classList 属性
  className: string, // 要查找的类名
): boolean {
  if (!node) {
    // 如果节点不存在，返回 false
    return false;
  }

  if (node.classList?.contains(className)) {
    // 如果当前节点的 classList 包含指定的类名，返回 true
    return true;
  } else if (node.parentNode) {
    // 如果当前节点没有指定类名，递归检查父节点
    return recursiveCheckNodeClass(node.parentNode as any, className);
  }

  // 如果遍历到根节点仍未找到，返回 false
  return false;
}
