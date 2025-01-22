import type { ComponentInternalInstance, VNode } from 'vue';
import { defineComponent, h, getCurrentInstance } from 'vue';

/**
 * 判断是否是vue3组件
 * @param comp
 * @returns
 */
export function isVueComponent(comp: any): boolean {
  const vnode: VNode | any = h(comp);
  if (!vnode.type) {
    return false;
  }

  // Check if it's just an HTML Element
  if (typeof vnode.type === 'string') {
    return false;
  }

  // A component that has render or setup property
  if (vnode.type.setup || vnode.type.render) {
    return true;
  }

  // Check if functional component
  // https://vuejs.org/guide/extras/render-function.html#functional-components
  if (vnode.type.emits || vnode.type.props) {
    return true;
  }

  return false;
}

/**
 *
 * @param comp
 * @param param1
 * @returns
 */
function createInnerComp(comp: string, { vnode: { ref, props, children } }: ComponentInternalInstance) {
  const vnode = h(comp, props, children as any);
  vnode.ref = ref;
  return vnode;
}

/**
 * 实现 react 的 forwardRef 函数
 * @param comp
 */
export function forwardRefComp(comp: string) {
  return defineComponent({
    name: 'Hoc',
    __asyncLoader: Promise.resolve(),
    setup() {
      const instance = getCurrentInstance();

      return () => createInnerComp(comp, instance!);
    },
  });
}
