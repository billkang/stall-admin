type JSSDKContext = {
  APP_USER: string;
};

export let context: JSSDKContext;

export function initContext(options: JSSDKContext) {
  context = {
    ...options,
  };
}
