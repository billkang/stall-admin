import type { ComponentPublicInstance } from 'vue';
import { IPublicTypeNpmInfo, IPublicTypeComponentSchema } from '@stall-lowcode/types';
import { forwardRefComp, isVueComponent } from './is-vue';
import { isESModule } from './is-es-module';

type Component = ComponentPublicInstance | object;

interface LibraryMap {
  [key: string]: string;
}

/**
 * 生成html组件
 * @param library
 * @returns
 */
export function generateHtmlComp(library: string): any {
  if (['a', 'img', 'div', 'span', 'svg'].includes(library)) {
    return forwardRefComp(library);
  }

  return null;
}

/**
 * 获取组件
 * @param library
 * @returns
 */
export function accessLibrary(library: string | Record<string, unknown>) {
  if (typeof library !== 'string') {
    return library;
  }

  return (window as any)[library] || generateHtmlComp(library);
}

/**
 * 获取子组件
 * @param library
 * @param paths
 */
export function getSubComponent(library: any, paths: string[]) {
  const len = paths.length;
  if (len < 1 || !library) {
    return library;
  }

  let i = 0;
  let component: any;

  while (i < len) {
    const key = paths[i];
    let err: Error | null = null;

    try {
      component = library[key] || component;
    } catch (e) {
      err = e;
      component = null;
    }

    if (i === 0 && component === null && key === 'default') {
      if (err) {
        return len === 1 ? library : null;
      }

      component = library;
    } else if (component === null) {
      return null;
    }

    library = component;
    i++;
  }

  return component;
}

/**
 * 寻找组件
 * @param libraryMap
 * @param componentName
 * @param npm
 */
function findComponent(libraryMap: LibraryMap, componentName: string, npm?: IPublicTypeNpmInfo) {
  if (!npm) {
    return accessLibrary(componentName);
  }

  // libraryName the key access to global
  // export { exportName } from xxx exportName === global.libraryName.exportName
  // export exportName from xxx   exportName === global.libraryName.default || global.libraryName
  // export { exportName as componentName } from package
  // if exportName == null exportName === componentName;
  // const componentName = exportName.subName, if exportName empty subName donot use
  const exportName = npm.exportName || npm.componentName || componentName;
  const libraryName = libraryMap[npm.package] || exportName;
  const library = accessLibrary(libraryName);
  const paths = npm.exportName && npm.subName ? npm.subName.split('.') : [];

  if (npm.destructuring) {
    paths.unshift(exportName);
  } else if (isESModule(library)) {
    paths.unshift('default');
  }

  return getSubComponent(library, paths);
}

/**
 * 获取组件对象
 * @param libraryMap
 * @param componentsMap
 * @param createComponent
 */
export function buildComponents(
  libraryMap: LibraryMap,
  componentsMap: { [componentName: string]: IPublicTypeNpmInfo | ComponentPublicInstance | IPublicTypeComponentSchema },
  createComponent?: (schema: IPublicTypeComponentSchema) => Component | null,
) {
  const components: Record<string, Component> = {};

  Object.keys(componentsMap).forEach((componentName: string) => {
    const component = componentsMap[componentName];

    if (component && (component as IPublicTypeComponentSchema).componentName === 'Component' && createComponent) {
      const _component = createComponent(component as IPublicTypeComponentSchema);
      if (_component) {
        components[componentName] = _component;
      }
    } else if (isVueComponent(component)) {
      components[componentName] = component;
    } else if ((component as IPublicTypeNpmInfo).isMicroWidget) {
      components[componentName] = component;
    } else {
      const _component = findComponent(libraryMap, componentName, component as IPublicTypeNpmInfo);
      if (_component) {
        components[componentName] = _component;
      }
    }
  });

  return components;
}
