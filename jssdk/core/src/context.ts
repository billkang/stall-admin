type JSSDKContext = {
  CORE_ACCESS: string;
};

// eslint-disable-next-line import/no-mutable-exports
export let context: JSSDKContext;

export function initContext(options: JSSDKContext) {
  context = {
    ...options,
  };
}
