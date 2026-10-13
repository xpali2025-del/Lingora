import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'out';
const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.html')) files.push(path);
  }
}
walk(root);
const headers = readFileSync(join(root, '_headers'), 'utf8');
const required = [
  'X-Content-Type-Options: nosniff',
  'Referrer-Policy: strict-origin-when-cross-origin',
  'Permissions-Policy:',
  'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
  "script-src 'self'",
];
for (const value of required) {
  if (!headers.includes(value))
    throw new Error(`Missing security header: ${value}`);
}
if (headers.includes("'unsafe-inline'"))
  throw new Error('CSP must not contain unsafe-inline.');
const [publicPolicy, adminPolicy = ''] = headers.split('\n/admin/*\n');
if (publicPolicy.includes('unpkg.com'))
  throw new Error('The public CSP must not allow the admin-only CDN.');
if (!adminPolicy.includes('https://unpkg.com'))
  throw new Error(
    'The admin-specific CSP must allow the configured Decap CMS asset host.',
  );

const hashes = new Set(
  [...headers.matchAll(/'sha256-[^']+'/g)].map((match) => match[0]),
);
let inlineScripts = 0;
for (const path of files) {
  const html = readFileSync(path, 'utf8');
  for (const match of html.matchAll(
    /<script\b(?![^>]*\bsrc=)(?![^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    if (!match[1].trim()) continue;
    inlineScripts += 1;
    const hash = `'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`;
    if (!hashes.has(hash))
      throw new Error(`CSP lacks hash for inline script in ${path}`);
  }
}
console.log(
  `Cloudflare headers verified; ${inlineScripts} inline scripts have CSP hashes.`,
);
