import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isInteractivePath } from './interactive-routes.mjs';

const removed = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith('.html') && !isInteractivePath(path)) {
      const html = readFileSync(path, 'utf8');
      const staticHtml = html
        .replace(
          /<script\b(?![^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi,
          '',
        )
        .replace(/<link\b(?=[^>]*\bas=["']script["'])[^>]*>/gi, '')
        .replace(/<link\b(?=[^>]*\brel=["']modulepreload["'])[^>]*>/gi, '');
      if (staticHtml !== html) {
        writeFileSync(path, staticHtml);
        removed.push(path);
      }
    }
  }
}
walk('out');
console.log(
  `Removed Next.js runtime scripts from ${removed.length} static content documents.`,
);
