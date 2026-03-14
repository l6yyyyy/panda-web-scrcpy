const express = require('express');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'public')));

// WebSocket 服务
const wss = new WebSocket.Server({ port: 8081 });
wss.on('connection', (ws) => {
  console.log('客户端已连接');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.action === 'connect' && msg.ip) {
        ws.send(JSON.stringify({ text: '正在连接设备: ' + msg.ip }));

        // ADB 连接
        const adb = spawn('adb', ['connect', msg.ip]);
        adb.stdout.on('data', (d) => {
          ws.send(JSON.stringify({ text: 'ADB: ' + d.toString() }));
        });

        adb.stderr.on('data', (d) => {
          ws.send(JSON.stringify({ error: '错误: ' + d.toString() }));
        });

        // 启动 scrcpy 推流
        setTimeout(() => {
          ws.send(JSON.stringify({ text: '启动画面推流...' }));
          const scrcpy = spawn('scrcpy', [
            '--tcpip',
            msg.ip,
            '--no-window',
            '--video',
            'stdout'
          ]);

          scrcpy.stdout.on('data', (stream) => {
            ws.send(stream); // 视频流推送到前端
          });
        }, 2000);
      }
    } catch (e) { }
  });
});

app.listen(PORT, () => {
  console.log('Web服务启动: http://localhost:' + PORT);
});
