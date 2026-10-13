import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['src'];
const banned =
  /(?:^|[;{\s])(margin|padding)-(?:left|right)\s*:|(?:^|[;{\s])(?:left|right)\s*:/m;
const failures = [];

function walk(path) {
  for (const entry of readdirSync(path)) {
    const full = join(path, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(css|tsx?)$/.test(entry)) {
      const text = readFileSync(full, 'utf8');
      if (banned.test(text)) failures.push(full);
    }
  }
}

for (const root of roots) walk(root);
if (failures.length) {
  console.error(
    `Physical-direction CSS properties found:\n${failures.join('\n')}`,
  );
  process.exit(1);
}
console.log('Logical CSS check passed.');
