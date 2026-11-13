// scripts/dev.mjs — build, serve dist/ on http://localhost:4173 and rebuild on change.
// Zero dependencies: Node's http + fs.watch, plus a tiny live-reload over SSE.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.txt': 'text/plain', '.pdf': 'application/pdf', '.ico': 'image/x-icon',
};
const clients = new Set();
const RELOAD = `<script>new EventSource('/__reload').onmessage=()=>location.reload()</script>`;

function build() {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [path.join(ROOT, 'scripts/build.mjs')], { stdio: 'inherit' });
    p.on('exit', (code) => { if (code === 0) for (const c of clients) c.write('data: reload\n\n'); resolve(); });
  });
}

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('\n'); clients.add(res); req.on('close', () => clients.delete(res)); return;
  }
  let file = path.join(DIST, url);
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  let status = 200;
  if (!fs.existsSync(file)) { file = path.join(DIST, '404.html'); status = 404; }
  const type = TYPES[path.extname(file)] || 'application/octet-stream';
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  if (type.startsWith('text/html')) res.end(fs.readFileSync(file, 'utf8').replace('</body>', RELOAD + '</body>'));
  else fs.createReadStream(file).pipe(res);
}).listen(PORT, async () => {
  await build();
  console.log(`\n  eshun.net → http://localhost:${PORT}\n`);
});

let timer;
for (const dir of ['src', 'public']) {
  fs.watch(path.join(ROOT, dir), { recursive: true }, (_, f) => {
    if (f && f.endsWith('manifest.json')) return;
    clearTimeout(timer);
    timer = setTimeout(build, 120);
  });
}
