class DataPipeline {
  constructor() {
    this.cache = new Map();
    this.stats = {
      lastMinute: [], // 保存最近一分钟的交易时间戳
      regionRank: new Map(), // 地区交易金额排名
      typeDistribution: new Map(), // 交易类型分布
    };
  }

  detectAnomaly(data) {
    // 示例：简单的异常检测逻辑
    return data.some((item) => item.amount > 5000); // 如果有交易金额超过5000，则认为是异常
  }

  process(chunk) {
    // 数据清洗：过滤无效数据
    const validData = chunk.filter(
      (item) =>
        item.amount > 0 && ['PAY', 'REFUND', 'TOPUP'].includes(item.type),
    );

    // 实时统计
    const now = Date.now();
    this.stats.lastMinute = [
      ...this.stats.lastMinute.filter((t) => t > now - 60_000), // 保留最近60秒的数据
      ...validData.map(() => now), // 添加新数据的时间戳
    ];

    validData.forEach((item) => {
      // 更新交易类型分布
      this.stats.typeDistribution.set(
        item.type,
        (this.stats.typeDistribution.get(item.type) || 0) + 1,
      );

      // 更新地区交易金额排名
      this.stats.regionRank.set(
        item.region,
        (this.stats.regionRank.get(item.region) || 0) + item.amount,
      );
    });

    // 异常检测逻辑（示例）
    const anomaly = this.detectAnomaly(validData);

    // 返回处理后的数据和异常信息
    return {
      anomaly, // 异常信息
      summary: {
        regions: [...this.stats.regionRank].sort((a, b) => b[1] - a[1]), // 地区交易金额排名
        total: this.stats.lastMinute.length, // 最近一分钟的交易总数
        types: Object.fromEntries(this.stats.typeDistribution), // 交易类型分布
      },
    };
  }
}

// Web Worker 主逻辑
self.onmessage = ({ data }) => {
  const processor = new DataPipeline();
  const result = processor.process(data.list); // 处理接收到的数据
  self.postMessage(result); // 将处理结果发送回主线程
};
