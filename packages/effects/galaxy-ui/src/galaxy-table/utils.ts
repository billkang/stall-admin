export function recursiveCheckNodeClass(node: Node & { classList: any }, className: string): boolean {
  if (!node) {
    return false;
  }

  if (node.classList?.contains(className)) {
    return true;
  } else if (node.parentNode) {
    return recursiveCheckNodeClass(node.parentNode as any, className);
  }

  return false;
}
