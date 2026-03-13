const express = require('express');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname,'public')));

const wss = new WebSocket.Server({ port: 8081 });
wss.on('connection', (ws) => {
  console.log("客户端已连接");
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.action === "connect" && msg.ip) {
        ws.send(JSON.stringify({text:"尝试连接："+msg.ip}));

        const adb = spawn("adb", ["connect", msg.ip]);
        adb.stdout.on("data", (d) => {
          ws.send(JSON.stringify({text:"ADB: "+d}));
        });
        adb.stderr.on("data", (d) => {
          ws.send(JSON.stringify({error:"错误："+d}));
        });
      }
    } catch(e) {}
  });
});

app.listen(PORT, ()=>{
  console.log("Web服务：http://localhost:"+PORT);
});
