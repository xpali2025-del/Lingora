import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { isInteractivePath } from './interactive-routes.mjs';

const scripts = new Set();
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith('.html') && !isInteractivePath(path)) {
      const html = readFileSync(path, 'utf8');
      for (const match of html.matchAll(
        /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi,
      )) {
        const src = match[1];
        if (src.startsWith('/')) scripts.add(resolve('out', `.${src}`));
      }
    }
  }
}
walk('out');
const bundle = [...scripts]
  .filter((path) => path.endsWith('.js'))
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n');
const output = '.size-budget/first-load.js';
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, bundle);
console.log(
  `Generated first-load JS budget input from ${scripts.size} content-page scripts (${bundle.length} bytes).`,
);
