const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const port = 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    // Basic CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    // Lightweight proxy for GET requests: /proxy?url=...
    if (req.url.startsWith('/proxy?')) {
        try {
            const parsed = new URL(req.url, `http://localhost:${port}`);
            const target = parsed.searchParams.get('url');
            if (!target) { res.writeHead(400); res.end('Missing url'); return; }
            const targetUrl = new URL(target);
            const lib = targetUrl.protocol === 'https:' ? https : http;
            const proxyReq = lib.get(targetUrl, (proxyRes) => {
                // Forward status and content-type
                const ct = proxyRes.headers['content-type'] || 'application/octet-stream';
                res.writeHead(proxyRes.statusCode || 200, { 'Content-Type': ct, 'Access-Control-Allow-Origin': '*' });
                proxyRes.pipe(res);
            });
            proxyReq.on('error', (err) => {
                res.writeHead(502);
                res.end('Proxy error: ' + err.message);
            });
        } catch (e) {
            res.writeHead(400);
            res.end('Bad proxy request');
        }
        return;
    }

    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);
    
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'text/plain';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(port, () => {
    console.log(`Bitcoin Price Chart server running at http://localhost:${port}/`);
});
