import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, relative, resolve } from 'node:path';

const root = resolve('out');
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? '0.0.0.0';
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

function securityHeaders(pathname) {
  const source = readFileSync(join(root, '_headers'), 'utf8');
  const blocks = source.split(/\n(?=\/)/);
  const general = blocks.find((block) => block.startsWith('/*')) ?? '';
  const selected = pathname.startsWith('/admin/')
    ? (blocks.find((block) => block.startsWith('/admin/*')) ?? '')
    : '';
  const lines = `${general}\n${selected}`.split('\n');
  const headers = {};
  for (const line of lines) {
    const match = line.match(/^\s{2}([^:]+):\s*(.+)$/);
    if (match) headers[match[1].toLowerCase()] = match[2];
  }
  return headers;
}

const server = createServer((request, response) => {
  const url = new URL(
    request.url ?? '/',
    `http://${request.headers.host ?? 'localhost'}`,
  );
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }
  const normalized = normalize(pathname).replace(/^([/\\]*\.\.[/\\])+/, '/');
  let file = resolve(root, `.${normalized}`);
  const fromRoot = relative(root, file);
  if (fromRoot.startsWith('..')) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  if (!existsSync(file)) {
    response
      .writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      .end('Not found');
    return;
  }
  if (statSync(file).isDirectory()) {
    if (!pathname.endsWith('/')) {
      response.writeHead(308, { location: `${pathname}/${url.search}` }).end();
      return;
    }
    file = join(file, 'index.html');
  }
  const headers = {
    ...securityHeaders(pathname),
    'content-type': types[extname(file)] ?? 'application/octet-stream',
  };
  if (pathname.startsWith('/_next/static/')) {
    headers['cache-control'] = 'public, max-age=31536000, immutable';
  }
  response.writeHead(200, headers);
  createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Static Lingora preview available at http://${host}:${port}`);
});
