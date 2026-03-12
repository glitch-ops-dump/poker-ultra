const http = require('http');
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname);

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '':      'text/html',
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '/prototype') {
    urlPath = '/prototype.html';
  }
  const filePath = path.join(BASE, urlPath);
  const ext = path.extname(filePath);
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/html' });
    res.end(content);
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found: ' + urlPath);
  }
}).listen(5050, () => {
  console.log('Prototype server running at http://localhost:5050/prototype');
});
