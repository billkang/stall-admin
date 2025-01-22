import type {
  IPublicModelNode as Node,
  IPublicTypeNodeSchema as NodeSchema,
  IPublicTypeContainerSchema as ContainerSchema,
  IPublicTypeNpmInfo,
  IPublicTypePackage,
} from '@stall-lowcode/types';
import { getRendererContextKey, type DesignMode } from '@stall-lowcode/hooks';
import {
  type PropType,
  type Component,
  type ComponentPublicInstance,
  h,
  reactive,
  provide,
  computed,
  defineComponent,
  shallowRef,
  watch,
  triggerRef,
  ref,
  watchEffect,
  Suspense,
} from 'vue';
import {
  type I18nMessages,
  type BlockScope,
  type ExtractPublicPropTypes,
  SchemaParser,
  type RuntimeScope,
} from './utils';
import config from './config';
import { RENDERER_COMPS } from './renderers';
import { createObjectSpliter, debounce, exportSchema, isArray, isBoolean } from '@stall-lowcode/utils';

const vueRendererProps = {
  scope: Object as PropType<BlockScope>,
  schema: {
    type: Object as PropType<ContainerSchema>,
    required: true,
  },
  passProps: Object as PropType<Record<string, unknown>>,
  packages: {
    type: Object as PropType<Record<string, IPublicTypePackage>>,
  },
  components: {
    type: Object as PropType<Record<string, Component | IPublicTypeNpmInfo>>,
    required: true,
  },
  /** 设计模式，可选值：live、design */
  designMode: {
    type: String as PropType<DesignMode>,
    default: 'live',
  },
  /** 设备信息 */
  device: String,
  /** 语言 */
  locale: String,
  messages: {
    type: Object as PropType<I18nMessages>,
    default: () => ({}),
  },
  getNode: Function as PropType<(id: string) => Node | null>,
  /** 组件获取 ref 时触发的钩子 */
  onCompGetCtx: Function as PropType<(schema: NodeSchema, ref: ComponentPublicInstance) => void>,
  thisRequiredInJSE: {
    type: Boolean,
    default: true,
  },
  disableCompMock: {
    type: [Array, Boolean] as PropType<string[] | boolean>,
    default: false,
  },
  appHelper: {
    type: Object as PropType<{
      utils?: Record<string, unknown>;
      constants?: Record<string, unknown>;
      [x: string]: unknown;
    }>,
  },
} as const;

type VueRendererProps = ExtractPublicPropTypes<typeof vueRendererProps>;

const splitOptions = createObjectSpliter(prop => !prop.match(/^[a-z]+([A-Z][a-z]+)*$/));

const VueRenderer = defineComponent({
  props: vueRendererProps,
  setup(props, { slots, expose }) {
    const parser = new SchemaParser({
      thisRequired: props.thisRequiredInJSE,
    }).initModule(props.schema);

    const triggerCompGetCtx = (schema: NodeSchema, val: ComponentPublicInstance) => {
      val && props.onCompGetCtx?.(schema, val);
    };
    const getNode = (id: string) => props.getNode?.(id) ?? null;

    const schemaRef = shallowRef(props.schema);
    watch(
      () => props.schema,
      () => (schemaRef.value = props.schema),
    );

    let needWrapComp: (name: string) => boolean = () => true;

    watchEffect(() => {
      const disableCompMock = props.disableCompMock;
      if (isBoolean(disableCompMock)) {
        needWrapComp = disableCompMock ? () => false : () => true;
      } else if (isArray(disableCompMock as string[])) {
        needWrapComp = name => !disableCompMock.includes(name);
      }
    });

    const wrapCached: Map<object, Map<object, any>> = new Map();

    const rendererContext = reactive({
      designMode: computed(() => props.designMode),
      packages: computed(() => props.packages),
      components: computed(() => ({
        ...config.getRenderers(),
        ...props.components,
      })),
      getNode: (id: string) => (props.getNode?.(id) as any) ?? null,
      triggerCompGetCtx: (schema: NodeSchema, inst: ComponentPublicInstance) => {
        props.onCompGetCtx?.(schema, inst);
      },
      rerender: debounce(() => {
        const id = props.schema.id;
        const node = id && getNode(id);
        if (node) {
          const newSchema = exportSchema<ContainerSchema>(node);
          if (newSchema) {
            schemaRef.value = newSchema;
          }
        }
        triggerRef(schemaRef);
      }),
      wrapLeafComp: <T extends object, L extends object>(name: string, comp: T, leaf: L): L => {
        let record = wrapCached.get(leaf);
        if (record) {
          const cachedComp = record.get(comp);
          if (cachedComp) return cachedComp;
        } else {
          record = new Map();
        }

        if (needWrapComp(name)) {
          const [privateOptions, _, privateOptionsCount] = splitOptions(comp as any);
          if (privateOptionsCount) {
            leaf = Object.create(leaf, Object.getOwnPropertyDescriptors(privateOptions));
          }
        }
        record.set(comp, leaf);
        return leaf;
      },
      appHelper: computed(() => props.appHelper),
    });

    provide(getRendererContextKey(), rendererContext);

    const runtimeScope = ref<RuntimeScope>();

    expose({ runtimeScope });

    const renderContent = () => {
      const { components } = rendererContext;
      const { scope, locale, messages, designMode, thisRequiredInJSE, passProps, appHelper } = props;
      const { value: schema } = schemaRef;

      if (!schema) return null;

      const { componentName } = schema;
      let Comp = components[componentName] || components[`${componentName}Renderer`];
      if (Comp && !(Comp as any).__renderer__) {
        Comp = RENDERER_COMPS[`${componentName}Renderer`];
      }

      return Comp
        ? h('div', [
            h(
              Suspense,
              {},
              {
                default: () =>
                  h(
                    Comp,
                    {
                      key: schema.__ctx ? `${schema.__ctx.lceKey}_${schema.__ctx.idx || '0'}` : schema.id,
                      ...passProps,
                      ...parser.parseOnlyJsValue(schema.props),
                      ref: runtimeScope,
                      __parser: parser,
                      __scope: scope,
                      __schema: schema,
                      __locale: locale,
                      __messages: messages,
                      __components: components,
                      __designMode: designMode,
                      __thisRequiredInJSE: thisRequiredInJSE,
                      __getNode: getNode,
                      __triggerCompGetCtx: triggerCompGetCtx,
                      __appHelper: appHelper,
                    } as any,
                    slots,
                  ),
                fallback: () => '',
              },
            ),
          ])
        : null;
    };

    return () => {
      const { device, locale } = props;
      const configProvider = config.getConfigProvider();
      return configProvider ? h(configProvider, { device, locale }, { default: renderContent }) : renderContent();
    };
  },
});

export const cleanCacledModules = () => {
  SchemaParser.cleanCacheModules();
};

export { VueRenderer, vueRendererProps };
export type { VueRendererProps, I18nMessages, BlockScope };
