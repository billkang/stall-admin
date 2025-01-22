import { useRendererContext } from '@stall-lowcode/hooks';
import { defineComponent, Fragment, getCurrentInstance, onMounted } from 'vue';
import { useRenderer, rendererProps, useRootScope } from '../core';

export const TempRenderer = defineComponent({
  name: 'TempRenderer',
  props: rendererProps,
  __renderer__: true,
  async setup(props, context) {
    const { scope, getSetupPromise } = useRootScope(props, context);
    const { triggerCompGetCtx } = useRendererContext();
    const { renderComp, schemaRef } = useRenderer(props, scope);

    const instance = getCurrentInstance()!;

    onMounted(() => {
      instance.proxy && triggerCompGetCtx(schemaRef.value, instance.proxy);
    });

    const promises = getSetupPromise();
    if (promises.length > 0) {
      await Promise.all(promises);
    }

    return () => renderComp(schemaRef.value, null, Fragment);
  },
});
