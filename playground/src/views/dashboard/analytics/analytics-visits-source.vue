<script lang="ts" setup>
import type { EchartsUIType } from '@stall/plugins/echarts';

import { onMounted, onUnmounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@stall/plugins/echarts';

const chartRef = ref<EchartsUIType>();
const socket = ref<WebSocket | null>(null);

const { renderEcharts, chartInstance } = useEcharts(chartRef);

// WebSocket连接管理
const connectWebSocket = () => {
  socket.value = new WebSocket('ws://localhost:8080');

  socket.value.onmessage = async ({ data }) => {
    try {
      const result = JSON.parse(data).filter(item => item.type === 'visit-source')[0].data.list ?? [];
      chartInstance.value?.setOption({
        series: [
          {
            data: result,
          },
        ],
      });
    } catch (error) {
      console.error('WebSocket message处理失败:', error);
    }
  };
};

const initCharts = () => {
  renderEcharts({
    legend: {
      bottom: '2%',
      left: 'center',
    },
    series: [
      {
        animationDelay() {
          return Math.random() * 100;
        },
        animationEasing: 'exponentialInOut',
        animationType: 'scale',
        avoidLabelOverlap: false,
        color: ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9'],
        data: [
          { name: '搜索引擎', value: 0 },
          { name: '直接访问', value: 0 },
          { name: '邮件营销', value: 0 },
          { name: '联盟广告', value: 0 },
        ],
        emphasis: {
          label: {
            fontSize: '12',
            fontWeight: 'bold',
            show: true,
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderRadius: 10,
          borderWidth: 2,
        },
        label: {
          position: 'center',
          show: false,
        },
        labelLine: {
          show: false,
        },
        name: '访问来源',
        radius: ['40%', '65%'],
        type: 'pie',
      },
    ],
    tooltip: {
      trigger: 'item',
    },
  });
};

onMounted(() => {
  // connectWebSocket();
  // initCharts();
});

onUnmounted(() => {
  socket.value?.close();
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
