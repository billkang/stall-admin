export interface Defer<T> {
  resolve(value?: T | PromiseLike<T>): void;
  reject(reason?: any): void;
  promise(): Promise<T>;
}

export function createDefer<T>(): Defer<T> {
  const d: any = {};

  const promise = new Promise<T>((resolve, reject) => {
    d.resolve = resolve;
    d.reject = reject;
  });

  d.promise = () => promise;

  return d;
}
