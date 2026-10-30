/* Dependency-free local preview; API secrets are read only from the environment. */
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {handleApi} from '../server/api.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const portIndex = process.argv.indexOf('--port');
const port = portIndex < 0 ? 8793 : Number(process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Invalid port');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
await import('./catalog-check.mjs');
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    let response;
    if (url.pathname === '/health' || url.pathname.startsWith('/api/')) {
      const chunks = [];
      let bytes = 0;
      for await (const chunk of req) { bytes += chunk.length; if (bytes > 16384) { res.writeHead(413); res.end(); return; } chunks.push(chunk); }
      response = await handleApi(new Request(url, {method:req.method, headers:req.headers, ...(['GET','HEAD'].includes(req.method) ? {} : {body:Buffer.concat(chunks)})}), process.env);
    } else {
      const relative = decodeURIComponent(url.pathname);
      const file = relative === '/' || relative === '/index.html' ? path.join(root, 'server/page.html') : path.resolve(root, 'public', '.' + relative);
      if (relative !== '/' && relative !== '/index.html' && !file.startsWith(path.join(root, 'public') + path.sep)) throw Error();
      response = new Response(await readFile(file), {headers:{'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'}});
    }
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`RoomBap preview http://127.0.0.1:${port}/`));
