import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, relative, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pathToFileURL } from 'node:url';

const root = resolve('out');
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? '0.0.0.0';
// Local preview only: without DATABASE_URL the API uses an in-memory Postgres (data resets on restart).
process.env.DATABASE_URL ||= 'pglite:memory';
const apiRoot = resolve('api');

async function serveApi(request, response, pathname) {
  const name = pathname.slice('/api/'.length).replace(/\/$/u, '');
  const file = join(apiRoot, `${name}.mjs`);
  if (!/^[a-z-]+$/u.test(name) || !existsSync(file)) {
    response
      .writeHead(404, { 'content-type': 'application/json' })
      .end('{"error":"not_found"}');
    return;
  }
  const routeModule = await import(pathToFileURL(file).href);
  const handler = routeModule[request.method ?? 'GET'];
  if (!handler) {
    response.writeHead(405).end();
    return;
  }
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const webResponse = await handler(
    new Request(`http://${request.headers.host ?? 'localhost'}${request.url}`, {
      method: request.method,
      headers: request.headers,
      body: body.length ? body : undefined,
    }),
  );
  response.writeHead(
    webResponse.status,
    Object.fromEntries(webResponse.headers),
  );
  if (webResponse.body) Readable.fromWeb(webResponse.body).pipe(response);
  else response.end();
}

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
  if (pathname.startsWith('/api/')) {
    serveApi(request, response, pathname).catch((error) => {
      console.error(error);
      if (!response.headersSent) response.writeHead(500);
      response.end();
    });
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
    // Mirror Cloudflare Pages, which serves the exported 404.html for unmatched paths.
    const notFoundPage = join(root, '404.html');
    if (existsSync(notFoundPage)) {
      response.writeHead(404, {
        ...securityHeaders(pathname),
        'content-type': 'text/html; charset=utf-8',
      });
      createReadStream(notFoundPage).pipe(response);
    } else {
      response
        .writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
        .end('Not found');
    }
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
