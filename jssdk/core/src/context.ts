type JSSDKContext = {
  CORE_ACCESS: string;
};

export let context: JSSDKContext;

export function initContext(options: JSSDKContext) {
  context = {
    ...options,
  };
}
