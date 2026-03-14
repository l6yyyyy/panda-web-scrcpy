const express = require('express');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'public')));

// 真实家用局域网网段（不会再扫 172.17.0.x）
function scanRealLAN() {
  const ips = [];
  for (let i = 2; i < 255; i++) {
    ips.push(`192.168.1.${i}`);
    ips.push(`192.168.0.${i}`);
    ips.push(`192.168.10.${i}`);
  }
  return ips;
}

const wss = new WebSocket.Server({ port: 8081 });
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      // 扫描真实设备
      if (msg.action === 'scan') {
        ws.send(JSON.stringify({ text: '正在扫描局域网…' }));
        const lanList = scanRealLAN();
        lanList.forEach(ip => {
          const adb = spawn('adb', ['connect', ip + ':5555']);
          adb.on('close', () => {
            ws.send(JSON.stringify({ action: 'deviceFound', ip: ip }));
          });
        });
      }

      // 真实连接
      if (msg.action === 'connect' && msg.ip) {
        ws.send(JSON.stringify({ text: '正在连接：' + msg.ip }));
        const adb = spawn('adb', ['connect', msg.ip]);
        adb.stdout.on('data', (out) => {
          ws.send(JSON.stringify({ text: '✅ ' + out.toString().trim() }));
        });
        adb.stderr.on('data', (err) => {
          ws.send(JSON.stringify({ text: '❌ 失败：' + err.toString().trim() }));
        });
      }
    } catch (e) {}
  });
});

app.listen(PORT, () => console.log('Web:' + PORT));
