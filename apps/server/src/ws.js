const WebSocket = require('ws');
const Mock = require('mockjs');

const wss = new WebSocket.Server({ port: 8080 }, () => {
  console.log('WebSocket server is running on port 8080');
});

wss.on('connection', (ws) => {
  // 模拟高频交易数据的生成和发送
  setInterval(() => {
    const data = Mock.mock({
      'list|50-100': [
        {
          id: '@guid',
          timestamp: +Mock.Random.date('T'),
          type: 'PAY|REFUND|TOPUP',
          'amount|100-10000': 1,
          region: '华东|华北|华南|西南',
          'riskLevel|1-5': 1,
        },
      ],
    });
    ws.send(JSON.stringify(data));
  }, 1000); // 每秒发送一次
});
