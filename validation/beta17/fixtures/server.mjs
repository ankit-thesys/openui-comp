import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { makeCell } from './payloads.mjs';
const root = path.resolve(process.env.BETA17_DIST);
const sessions = new Map();
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const session = url.searchParams.get('session') ?? 'functional';
  const stats = sessions.get(session) ?? {started:0,completed:0,cancelled:0,active:0,activeTimers:0};
  sessions.set(session, stats);
  if (url.pathname === '/stats') {res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(stats));}
  if (url.pathname === '/cell' || url.pathname === '/stream') {
    let cell;
    try {cell = makeCell(url.searchParams.get('workload') ?? 'chat',url.searchParams.get('load') ?? 'paced');} catch {res.writeHead(400); return res.end();}
    if (url.pathname === '/cell') {res.setHeader('Content-Type','application/json'); return res.end(JSON.stringify(cell));}
    stats.started++; stats.active++;
    res.setHeader('Content-Type','text/plain; charset=utf-8'); res.setHeader('Cache-Control','no-store'); res.flushHeaders();
    const bytes = Buffer.from(cell.payload); let offset = 0, complete = false;
    stats.activeTimers++;
    const timer = setInterval(() => {
      res.write(bytes.subarray(offset, offset + cell.chunk)); offset += cell.chunk;
      if (offset >= bytes.length) {complete = true; res.end();}
    }, cell.rate);
    res.once('close', () => {clearInterval(timer); stats.activeTimers--;stats.active--;stats[complete ? 'completed' : 'cancelled']++;});
    return;
  }
  try {
    const relative = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
    const file = path.resolve(root, '.' + relative);
    if (!file.startsWith(root + path.sep)) {res.writeHead(403);return res.end();}
    const content = await fs.readFile(file);
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream');
    res.end(content);
  } catch {res.writeHead(404);res.end();}
});
server.listen(Number(process.env.BETA17_PORT ?? 4197),'127.0.0.1',()=>console.log('beta17 ready'));
process.on('SIGTERM',()=>server.close());
