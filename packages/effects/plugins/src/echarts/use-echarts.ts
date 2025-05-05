import type { EChartsOption } from 'echarts';

import type { Ref } from 'vue';

import type EchartsUI from './echarts-ui.vue';

import { computed, nextTick, ref, watch } from 'vue';

import { usePreferences } from '@stall/preferences';

import {
  tryOnUnmounted,
  useDebounceFn,
  useResizeObserver,
  useTimeoutFn,
  useWindowSize,
} from '@vueuse/core';

import echarts from './echarts';

type EchartsUIType = typeof EchartsUI | undefined;

type EchartsThemeType = 'dark' | 'light' | null;

function useEcharts(chartRef: Ref<EchartsUIType>) {
  const chartInstance: Ref<echarts.ECharts | null> = ref(null);
  let cacheOptions: EChartsOption = {};

  const { isDark } = usePreferences();
  const { height, width } = useWindowSize();
  const resizeHandler: () => void = useDebounceFn(resize, 200);

  const getOptions = computed((): EChartsOption => {
    if (!isDark.value) {
      return {};
    }

    return {
      backgroundColor: 'transparent',
    };
  });

  const initCharts = (t?: EchartsThemeType) => {
    const el = chartRef?.value?.$el;
    if (!el) {
      return;
    }
    chartInstance.value = echarts.init(el, t || isDark.value ? 'dark' : null);

    return chartInstance;
  };

  const renderEcharts = (options: EChartsOption, clear = true) => {
    cacheOptions = options;
    const currentOptions = {
      ...options,
      ...getOptions.value,
    };
    return new Promise((resolve) => {
      if (chartRef.value?.offsetHeight === 0) {
        useTimeoutFn(() => {
          renderEcharts(currentOptions);
          resolve(null);
        }, 30);
        return;
      }
      nextTick(() => {
        useTimeoutFn(() => {
          if (!chartInstance.value) {
            const instance = initCharts();
            if (!instance) return;
          }
          clear && chartInstance.value?.clear();
          chartInstance.value?.setOption(currentOptions);
          resolve(null);
        }, 30);
      });
    });
  };

  function resize() {
    chartInstance.value?.resize({
      animation: {
        duration: 300,
        easing: 'quadraticIn',
      },
    });
  }

  watch([width, height], () => {
    resizeHandler?.();
  });

  useResizeObserver(chartRef as never, resizeHandler);

  watch(isDark, () => {
    if (chartInstance.value) {
      chartInstance.value.dispose();
      initCharts();
      renderEcharts(cacheOptions);
      resize();
    }
  });

  tryOnUnmounted(() => {
    // 销毁实例，释放资源
    chartInstance.value?.dispose();
  });
  return {
    renderEcharts,
    resize,
    chartInstance,
  };
}

export { useEcharts };

export type { EchartsUIType };
