import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import {
  buildIntentRegistry,
  checkGovernance,
  checkMarkets,
} from '../src/lib/content-governance.mjs';
import {
  loadAllRecords,
  loadLocales,
  loadMarkets,
} from '../src/lib/load-content.mjs';

const registryPath = 'content/intent-registry.json';
const records = loadAllRecords();
const registry = buildIntentRegistry(records);
const serialized = `${JSON.stringify(registry, null, 2)}\n`;

if (process.argv.includes('--write')) {
  writeFileSync(registryPath, serialized);
  console.log(`Wrote ${registry.length} intents to ${registryPath}.`);
  process.exit(0);
}

const failures = [
  ...checkGovernance(records, { today: new Date().toISOString().slice(0, 10) }),
  ...checkMarkets(loadMarkets(), loadLocales()),
];
if (
  !existsSync(registryPath) ||
  readFileSync(registryPath, 'utf8') !== serialized
)
  failures.push(
    `${registryPath} is stale; run "npm run registry:write" and commit it.`,
  );
if (failures.length) {
  console.error(`Content governance failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `Content governance passed: ${registry.length} registered intents, ${records.length} records scanned.`,
);
