import { defineComponent, h, provide, ref } from 'vue';

import { Spin } from '@arco-design/web-vue';
import { IconRefresh } from '@arco-design/web-vue/es/icon';

import { emitter, ENUM_REQUEST_EVENT, request } from './request';

export default defineComponent({
  setup(_props, { slots }) {
    provide('request', request);

    const loading = ref<boolean>(false);
    const error = ref<string>('');

    emitter.on(
      ENUM_REQUEST_EVENT.LOADING,
      (data: boolean) => (loading.value = data),
    );
    emitter.on(
      ENUM_REQUEST_EVENT.ERROR,
      (message: string) => (error.value = message),
    );

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
                    h(IconRefresh, {
                      onClick: () => handleRefresh(),
                      style: { cursor: 'pointer' },
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
