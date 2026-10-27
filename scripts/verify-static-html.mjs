import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { isInteractivePath } from './interactive-routes.mjs';

const failures = [];
const htmlFiles = [];
for (const required of ['out/index.html', 'out/en/index.html']) {
  try {
    readFileSync(required);
  } catch {
    failures.push(`${required}: expected static route is missing`);
  }
}
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (!isInteractivePath(`${path}/`)) walk(path);
    } else if (path.endsWith('.html')) htmlFiles.push(path);
  }
}
walk('out');
for (const path of htmlFiles) {
  const html = readFileSync(path, 'utf8');
  if (
    /<script\b(?![^>]*\btype=["']application\/ld\+json["'])|<link\b(?=[^>]*\bas=["']script["'])|<link\b(?=[^>]*\brel=["']modulepreload["'])/i.test(
      html,
    )
  ) {
    failures.push(
      `${path}: script element or script preload remains in static content HTML`,
    );
  }
}
if (failures.length) {
  console.error(`Static HTML check failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `Static HTML check passed for ${htmlFiles.length} content documents; no scripts are required.`,
);
