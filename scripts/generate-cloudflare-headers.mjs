import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outputDir = 'out';
const htmlFiles = [];
function walk(dir) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name);
    if (name.isDirectory()) walk(path);
    else if (name.name.endsWith('.html')) htmlFiles.push(path);
  }
}
walk(outputDir);

const hashes = new Set();
for (const path of htmlFiles) {
  const html = readFileSync(path, 'utf8');
  for (const match of html.matchAll(
    /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    const script = match[1];
    if (script.trim())
      hashes.add(
        `'sha256-${createHash('sha256').update(script).digest('base64')}'`,
      );
  }
}

const scriptSources = ["'self'", ...hashes].join(' ');
const headers = `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload\n  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src ${scriptSources}; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; upgrade-insecure-requests\n\n/admin/*\n  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://unpkg.com; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.github.com https://oauth.example.invalid; upgrade-insecure-requests\n`;
writeFileSync(join(outputDir, '_headers'), headers);
console.log(
  `Generated Cloudflare security headers with ${hashes.size} inline-script hashes for ${htmlFiles.length} HTML files.`,
);
