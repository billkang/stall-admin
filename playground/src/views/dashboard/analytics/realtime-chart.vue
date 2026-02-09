<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';

import * as echarts from 'echarts';

interface WorkerMessage {
  anomaly: boolean;
  summary: {
    regions: [string, number][];
    total: number;
    types: Record<string, number>;
  };
}

interface WorkerTask {
  data: any;
  resolve: (value: WorkerMessage) => void;
}

const props = defineProps({
  workerUrl: {
    required: true,
    type: String,
  },
});

class WorkerScheduler {
  private pool: { busy: boolean; instance: Worker }[];
  private queue: WorkerTask[];

  constructor(workerUrl: string, maxWorkers = 4) {
    this.pool = Array.from({ length: maxWorkers }, () => ({
      busy: false,
      instance: new Worker(workerUrl),
    }));
    this.queue = [];
  }

  dispatch(data: any): Promise<WorkerMessage> {
    return new Promise((resolve) => {
      const availableWorker = this.pool.find((w) => !w.busy);

      if (availableWorker) {
        availableWorker.busy = true;
        availableWorker.instance.onmessage = (
          e: MessageEvent<WorkerMessage>,
        ) => {
          availableWorker.busy = false;
          resolve(e.data);
          this.processQueue();
        };
        availableWorker.instance.postMessage(data);
      } else {
        this.queue.push({ data, resolve });
      }
    });
  }

  terminateAll() {
    this.pool.forEach((worker) => worker.instance.terminate());
  }

  private processQueue() {
    if (this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.dispatch(task.data).then(task.resolve);
    }
  }
}

const lineChartEl = ref<HTMLDivElement | null>(null);
const pieChartEl = ref<HTMLDivElement | null>(null);
const barChartEl = ref<HTMLDivElement | null>(null);
const lineChart = ref<echarts.ECharts | null>(null);
const pieChart = ref<echarts.ECharts | null>(null);
const barChart = ref<echarts.ECharts | null>(null);
const socket = ref<null | WebSocket>(null);
const workerScheduler = ref<null | WorkerScheduler>(null);

// 初始化Worker调度器
const initWorkerScheduler = () => {
  workerScheduler.value = new WorkerScheduler(props.workerUrl, 4);
};

// 初始化图表
const initCharts = () => {
  if (!lineChartEl.value || !pieChartEl.value || !barChartEl.value) return;
  // echarts 5 类型定义中 RendererType 未包含 'webgl'，运行时支持
  const initOpts = { renderer: 'webgl' } as any;
  lineChart.value = echarts.init(lineChartEl.value, null, initOpts);
  pieChart.value = echarts.init(pieChartEl.value, null, initOpts);
  barChart.value = echarts.init(barChartEl.value, null, initOpts);

  // 设置初始图表选项
  lineChart.value.setOption({
    series: [{ data: Array.from({ length: 60 }).fill(0), type: 'line' }],
    xAxis: {
      data: Array.from({ length: 60 })
        .fill(null)
        .map((_, i) => i + 1),
      type: 'category',
    },
    yAxis: { type: 'value' },
  });

  pieChart.value.setOption({
    legend: {
      bottom: '2%',
      left: 'center',
    },
    series: [
      {
        data: [],
        type: 'pie',
      },
    ],
  });

  barChart.value.setOption({
    series: [{ data: [], type: 'bar' }],
    xAxis: { data: [], type: 'category' },
    yAxis: { type: 'value' },
  });
};

// WebSocket连接管理
const connectWebSocket = () => {
  socket.value = new WebSocket('ws://localhost:8080');

  socket.value.onmessage = async ({ data }) => {
    try {
      if (workerScheduler.value) {
        const transactionData = JSON.parse(data).find(
          (item: { type: string }) => item.type === 'transaction',
        ).data;
        const result = await workerScheduler.value.dispatch(transactionData);
        updateCharts(result);
      }
    } catch (error) {
      console.error('WebSocket message处理失败:', error);
    }
  };
};

// 更新图表
const updateCharts = ({ anomaly, summary }: WorkerMessage) => {
  if (lineChart.value) {
    // 更新主趋势图
    const seriesArr = lineChart.value.getOption().series as unknown as
      | Array<{ data: number[] }>
      | undefined;
    const series0 = seriesArr?.[0];
    const lineData = (series0?.data ?? []).slice(1) as number[];
    lineData.push(summary.total);
    lineChart.value.setOption({ series: [{ data: lineData }] });
  }

  if (pieChart.value) {
    // 更新饼图
    const pieData = Object.entries(summary.types).map(([type, count]) => ({
      name: type,
      value: count,
    }));
    pieChart.value.setOption({ series: [{ data: pieData }] });
  }

  if (barChart.value) {
    // 更新柱状图
    const barCategories = summary.regions.map(([region]) => region);
    const barData = summary.regions.map(([, amount]) => amount);
    barChart.value.setOption({
      series: [{ data: barData }],
      xAxis: { data: barCategories },
    });
  }

  // 处理异常
  if (anomaly) {
    console.warn('检测到异常交易:', anomaly);
  }
};

// 生命周期钩子
onMounted(() => {
  initWorkerScheduler();
  initCharts();
  connectWebSocket();
});

onUnmounted(() => {
  socket.value?.close();
  workerScheduler.value?.terminateAll();
});
</script>

<template>
  <div class="dashboard">
    <div ref="lineChartEl" class="chart"></div>
    <div ref="pieChartEl" class="chart"></div>
    <div ref="barChartEl" class="chart"></div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 20px;
}

.chart {
  width: 100%;
  height: 300px;
}
</style>
