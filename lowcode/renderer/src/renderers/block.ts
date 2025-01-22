import { useRendererContext } from '@stall-lowcode/hooks';
import { defineComponent, Fragment, getCurrentInstance, onMounted } from 'vue';
import { useRenderer, rendererProps, useRootScope } from '../core';
import { isFragment } from '../core/use';

export const BlockRenderer = defineComponent({
  name: 'BlockRenderer',
  props: rendererProps,
  __renderer__: true,
  async setup(props, context) {
    const { scope, getSetupPromise } = useRootScope(props, context);
    const { triggerCompGetCtx } = useRendererContext();
    const { renderComp, schemaRef, componentsRef } = useRenderer(props, scope);

    const Component = componentsRef.value[schemaRef.value.componentName] || Fragment;
    const instance = getCurrentInstance();

    if (isFragment(Component)) {
      onMounted(() => {
        instance?.proxy && triggerCompGetCtx(schemaRef.value, instance.proxy);
      });
    }

    const promises = getSetupPromise();
    if (promises.length > 0) {
      await Promise.all(promises);
    }

    return () => {
      return renderComp(schemaRef.value, null, componentsRef.value.Block || Fragment);
    };
  },
});
