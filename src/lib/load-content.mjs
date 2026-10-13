import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'content');
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** Every content record (core pages and blog articles) across all locales. */
export function loadAllRecords() {
  const records = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    for (const dir of [
      join(root, entry.name),
      join(root, entry.name, 'blog'),
    ]) {
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir)) {
        if (!file.endsWith('.json')) continue;
        records.push({ ...readJson(join(dir, file)), _file: join(dir, file) });
      }
    }
  }
  return records;
}

export function loadMarkets() {
  return readJson(join(root, 'markets.json'));
}

export function loadLocales() {
  return readJson(join(process.cwd(), 'src', 'i18n', 'locales.json'));
}

export function loadAngles() {
  return readJson(join(process.cwd(), 'src', 'i18n', 'angles.json'));
}
