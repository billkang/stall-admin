import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';
import microWidget from './micro-widget';
import type { OuterComponentDesc } from './micro-widget-types';

interface ISchema {
  componentName: string;
  props?: {
    [key: string]: boolean | string | number | null;
  };
  children?: Array<ISchema> | string;
}

export default defineComponent({
  props: {
    schema: {
      type: Object as PropType<ISchema>,
      required: true,
    },
    component: {
      type: Object as PropType<OuterComponentDesc>,
      default: null,
    },
  },
  setup(props) {
    microWidget.start();

    const renderComp = (schema: ISchema) => {
      const { component } = props;
      const { componentName, props: compProps, children = [] } = schema;

      if (component) {
        const { library, framework, source, exportName, destructuring } = component;
        return h('micro-widget', {
          name: `${componentName}`,
          component: JSON.stringify({
            library,
            framework,
            source,
            destructuring,
            exportName,
            props: compProps,
            children,
          }),
        });
      } else {
        return h(componentName, compProps, renderChildren(children));
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderChildren = (children: Array<ISchema> | string | undefined): any => {
      if (children) {
        if (typeof children === 'string') {
          return children;
        } else if (Array.isArray(children)) {
          return children.map(child => renderComp(child));
        }
      }

      return null;
    };

    return () => renderComp(props.schema);
  },
});
