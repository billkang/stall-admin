import { defineComponent, h, ref, provide } from 'vue';
import { Spin } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import { request, emitter, ENUM_REQUEST_EVENT } from './request';

export default defineComponent({
  setup(_props, { slots }) {
    provide('request', request);

    const loading = ref<boolean>(false);
    const error = ref<string>('');

    emitter.on(ENUM_REQUEST_EVENT.LOADING, (data: boolean) => (loading.value = data));
    emitter.on(ENUM_REQUEST_EVENT.ERROR, (message: string) => (error.value = message));

    const handleRefresh = () => {
      error.value = '';
    };

    return () => [
      h(
        'div',
        {
          class: 'jssdk-custom-element-wrapper',
        },
        [
          h(
            Spin,
            {
              spinning: loading.value,
              style: { width: '100%' },
            },
            [
              error.value
                ? h('div', [
                    h('span', { style: { 'margin-right': '8px' } }, [
                      `组件加载失败: ${error.value}`,
                    ]),
                    h(ReloadOutlined, {
                      style: { cursor: 'pointer' },
                      onClick: () => handleRefresh(),
                    }),
                  ])
                : slots.default && slots.default(),
            ],
          ),
        ],
      ),
    ];
  },
});
