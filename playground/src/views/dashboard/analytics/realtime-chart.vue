<template>
  <div class="dashboard">
    <div ref="lineChart" class="chart"></div>
    <div ref="pieChart" class="chart"></div>
    <div ref="barChart" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/gl';

const props = defineProps({
  workerUrl: {
    type: String,
    required: true
  }
});

const lineChart = ref(null);
const pieChart = ref(null);
const barChart = ref(null);
const socket = ref(null);
const workerScheduler = ref(null);

// 初始化Worker调度器
const initWorkerScheduler = () => {
  class WorkerScheduler {
    constructor(workerUrl, maxWorkers = 4) {
      this.pool = Array.from({ length: maxWorkers }, () => ({
        instance: new Worker(workerUrl),
        busy: false
      }));
      this.queue = [];
    }

    dispatch(data) {
      return new Promise(resolve => {
        const availableWorker = this.pool.find(w => !w.busy);

        if (availableWorker) {
          availableWorker.busy = true;
          availableWorker.instance.onmessage = (e) => {
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

    processQueue() {
      if (this.queue.length > 0) {
        const task = this.queue.shift();
        this.dispatch(task.data).then(task.resolve);
      }
    }
  }
  workerScheduler.value = new WorkerScheduler(props.workerUrl, 4);
};

// 初始化图表
const initCharts = () => {
  lineChart.value = echarts.init(lineChart.value, null, { renderer: 'webgl' });
  pieChart.value = echarts.init(pieChart.value, null, { renderer: 'webgl' });
  barChart.value = echarts.init(barChart.value, null, { renderer: 'webgl' });

  // 设置初始图表选项
  lineChart.value.setOption({
    xAxis: {
      type: 'category',
      data: Array(60).fill(null).map((_, i) => i + 1)
    },
    yAxis: { type: 'value' },
    series: [{ data: Array(60).fill(0), type: 'line' }]
  });

  pieChart.value.setOption({
    series: [{
      type: 'pie',
      data: []
    }]
  });

  barChart.value.setOption({
    xAxis: { type: 'category', data: [] },
    yAxis: { type: 'value' },
    series: [{ data: [], type: 'bar' }]
  });
};

// WebSocket连接管理
const connectWebSocket = () => {
  socket.value = new WebSocket('ws://localhost:8080');

  socket.value.onmessage = async ({ data }) => {
    try {
      const result = await workerScheduler.value.dispatch(JSON.parse(data));
      updateCharts(result);
    } catch (error) {
      console.error('WebSocket message处理失败:', error);
    }
  };
};

// 更新图表
const updateCharts = ({ summary, anomaly }) => {
  // 更新主趋势图
  const lineData = lineChart.value.getOption().series[0].data.slice(1);
  lineData.push(summary.total);
  lineChart.value.setOption({ series: [{ data: lineData }] });

  // 更新饼图
  const pieData = Object.entries(summary.types).map(([type, count]) => ({ name: type, value: count }));
  pieChart.value.setOption({ series: [{ data: pieData }] });

  // 更新柱状图
  const barCategories = summary.regions.map(([region]) => region);
  const barData = summary.regions.map(([, amount]) => amount);
  barChart.value.setOption({
    xAxis: { data: barCategories },
    series: [{ data: barData }]
  });

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
  workerScheduler.value.pool.forEach(worker => worker.instance.terminate());
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.chart {
  width: 100%;
  height: 300px;
}
</style>
