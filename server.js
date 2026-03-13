const express = require('express');
const WebSocket = require('ws');
const adb = require('adbkit');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'public')));
const client = adb.createClient();

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'connect') {
        await client.connect(msg.ip, 5555);
        ws.send(JSON.stringify({ type: 'status', text: '设备连接成功' }));

        const scrcpy = spawn('scrcpy', [
          '--serial', msg.ip, '--no-window', '--video-codec=vp8', '--port=0'
        ]);

        scrcpy.stdout.on('data', (d) => {
          ws.send(JSON.stringify({ type: 'stream', data: d.toString('base64') }));
        });
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', text: '连接失败：' + e.message }));
    }
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('upgrade', (req, sock, head) => {
  wss.handleUpgrade(req, sock, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});
