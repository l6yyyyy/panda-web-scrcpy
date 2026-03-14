const express = require('express');
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
  console.log('客户端已连接');

  ws.on('message', (data) => {
    const msg = JSON.parse(data);

    // 手动连接 + 启动画面
    if (msg.action === 'connect' && msg.ip) {
      ws.send(JSON.stringify({ text: '连接：' + msg.ip }));

      // 连接 ADB
      spawn('adb', ['connect', msg.ip]);

      // 启动 scrcpy 视频流
      const scrcpy = spawn('scrcpy', [
        '--serial', msg.ip.split(':')[0],
        '--no-audio',
        '--video', 'stdout',
        '--max-size', '800'
      ]);

      scrcpy.stdout.on('data', (stream) => {
        ws.send(stream); // 发送视频流到前端
      });
    }
  });
});

server.listen(8080, () => {
  console.log('Panda Web Scrcpy 启动：http://localhost:8080');
});
