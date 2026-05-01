const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8787;
const webRoot = path.join(__dirname, '../../apps/web');

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/health') {
    return json(res, 200, { status: 'ok', ts: new Date().toISOString() });
  }

  if (req.url === '/' || req.url === '/index.html') {
    const file = path.join(webRoot, 'index.html');
    return fs.readFile(file, (err, content) => {
      if (err) return json(res, 500, { error: 'index read error' });
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
  }

  json(res, 404, { error: 'not found' });
});

server.listen(port, () => {
  console.log(`KangBa API/Web server started at http://localhost:${port}`);
});
