const express = require('express');
const WebSocket = require('ws');
const { spawn, execSync } = require('child_process');
const path = require('path');
const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'public')));

// 扫描局域网 ADB 设备
function scanDevices() {
  let devices = [];
  try {
    let localIPs = [];
    let raw = execSync("hostname -I | awk '{print $1}'").toString().trim();
    if (raw) {
      let base = raw.split('.').slice(0, 3).join('.');
      for (let i = 2; i < 255; i++) {
        let ip = base + '.' + i;
        devices.push(ip);
      }
    }
  } catch (e) {}
  return devices;
}

const wss = new WebSocket.Server({ port: 8081 });
wss.on('connection', (ws) => {
  console.log('客户端已连接');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      // 扫描设备
      if (msg.action === 'scan') {
        ws.send(JSON.stringify({ text: '正在扫描局域网设备...' }));
        let list = scanDevices();
        list.forEach(ip => {
          const adb = spawn('adb', ['connect', ip + ':5555']);
          adb.on('close', () => {
            ws.send(JSON.stringify({ action: 'deviceFound', ip: ip }));
          });
        });
      }

      // 连接设备
      if (msg.action === 'connect' && msg.ip) {
        ws.send(JSON.stringify({ text: '连接：' + msg.ip }));
        spawn('adb', ['connect', msg.ip]);
        setTimeout(() => {
          const scrcpy = spawn('scrcpy', [
            '--tcpip', msg.ip, '--no-window', '--video', 'stdout'
          ]);
          scrcpy.stdout.on('data', (s) => ws.send(s));
        }, 1500);
      }
    } catch (e) {}
  });
});

app.listen(PORT, () => {
  console.log('服务启动：http://localhost:' + PORT);
});
