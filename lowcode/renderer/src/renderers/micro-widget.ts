import { defineComponent, h } from 'vue';
import LowcodeMicroWidgetRenderer from '@stall-lowcode/micro-widget';
import { rendererProps } from '../core';
import { IPublicTypeNodeData, IPublicTypeNpmInfo, IPublicTypePackage } from '@stall-lowcode/types';

export const MicroWidgetRenderer = defineComponent({
  name: 'MicroWidgetRenderer',
  props: rendererProps,
  __renderer__: true,
  __metadata__: {},
  setup() {
    const { component, schema, packages } = MicroWidgetRenderer.__metadata__ as {
      component: IPublicTypeNpmInfo;
      schema: IPublicTypeNodeData;
      packages: Record<string, IPublicTypePackage>;
    };
    const { package: _package, destructuring, framework, exportName } = component;
    const { urls, library } = packages[_package];

    return () =>
      h(LowcodeMicroWidgetRenderer, {
        schema,
        component: {
          library,
          framework,
          source: {
            scripts: urls.filter((url: string) => !url.endsWith('.css')),
            styles: urls.filter((url: string) => url.endsWith('.css')),
          },
          exportName,
          destructuring,
        },
      });
  },
});
