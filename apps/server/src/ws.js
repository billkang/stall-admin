const { type } = require('node:os');

const Mock = require('mockjs');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log('WebSocket server is running on port 8080');
});

wss.on('connection', (ws) => {
  // 模拟高频交易数据的生成和发送
  setInterval(() => {
    const transactionData = Mock.mock({
      'list|50-100': [
        {
          id: '@guid',
          timestamp: +Mock.Random.date('T'),
          'type|1': ['PAY', 'REFUND', 'TOPUP'],
          'amount|100-10000': 1,
          'region|1': ['华东', '华北', '华南', '西南', '华中'],
          'riskLevel|1-5': 1,
        },
      ],
    });

    const visitSourceData = Mock.mock({
      list: [
        { name: '搜索引擎', value: '@integer(500, 2000)' },
        { name: '直接访问', value: '@integer(300, 1500)' },
        { name: '邮件营销', value: '@integer(200, 1000)' },
        { name: '联盟广告', value: '@integer(200, 1000)' },
      ],
    });

    ws.send(
      JSON.stringify([
        {
          type: 'transaction',
          data: transactionData,
        },
        {
          type: 'visit-source',
          data: visitSourceData,
        },
      ]),
    );
  }, 5000); // 每5秒发送一次
});
