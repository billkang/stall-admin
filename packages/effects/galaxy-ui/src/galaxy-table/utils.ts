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

const opt = Object.prototype.toString;

export function isArray(obj: any): obj is any[] {
  return opt.call(obj) === '[object Array]';
}

export function isValidValue(val: any) {
  return val !== null && val !== undefined && val !== '';
}
