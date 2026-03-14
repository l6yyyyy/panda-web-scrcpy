const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.url.startsWith('/connect')) {
    const ip = new URL(req.url, 'http://localhost').searchParams.get('ip');
    if (!ip) {
      res.writeHead(400);
      return res.end('Missing IP');
    }
    spawn('adb', ['connect', ip]);
    const scrcpy = spawn('scrcpy', [
      '--tcpip', ip.split(':')[0],
      '--no-audio',
      '--video', 'stdout'
    ]);
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    scrcpy.stdout.pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(8080, () => {
  console.log('Server running on port 8080');
});
