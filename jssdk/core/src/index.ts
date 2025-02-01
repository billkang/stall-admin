import { defineCustomElement } from './defineCustomElement';

export * from './context';

export function defineJSSDK(name: string, options: Record<string, any>) {
  const jsSDKName = `stall-jssdk-${name}`;

  if (customElements.get(jsSDKName)) {
    console.error(`*** customElements '${jsSDKName}' already existed!`);
    return;
  }

  if (!options.styles) {
    options.styles = [];
  }

  options.styles.push(``);

  customElements.define(jsSDKName, defineCustomElement(options));
}
