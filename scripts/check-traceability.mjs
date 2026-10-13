import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const specRoot = resolve('specs');
const trace = readFileSync(resolve(specRoot, 'TRACEABILITY.md'), 'utf8');
const specFiles = [
  resolve(specRoot, '001-foundation/spec.md'),
  resolve(specRoot, '002-content-seo/spec.md'),
];
const taskFiles = [
  resolve(specRoot, '001-foundation/tasks.md'),
  resolve(specRoot, '002-content-seo/tasks.md'),
];
const testFiles = [
  resolve(specRoot, '001-foundation/tests.md'),
  resolve(specRoot, '002-content-seo/tests.md'),
];
const readMany = (files) =>
  files.map((file) => readFileSync(file, 'utf8')).join('\n');
const specs = readMany(specFiles);
const tasks = readMany(taskFiles);
const tests = readMany(testFiles);
const reqIds = [...specs.matchAll(/### (REQ-[A-Z]+-\d{3})/g)].map(
  (match) => match[1],
);
const taskIds = new Set(
  [...tasks.matchAll(/\b(TASK-[A-Z]+-\d{3})\b/g)].map((match) => match[1]),
);
const testRows = [
  ...tests.matchAll(/^\|\s*(TEST-[A-Z]+-\d{3})\s*\|\s*([^|]+)\s*\|/gm),
];
const testIds = new Set(testRows.map((match) => match[1]));
const traceRows = trace.split('\n').filter((line) => /^\| REQ-/.test(line));
const failures = [];

for (const reqId of reqIds) {
  const row = traceRows.find((line) => line.includes(`| ${reqId} |`));
  if (!row) {
    failures.push(`${reqId}: missing from traceability matrix`);
    continue;
  }
  const columns = row.split('|').map((column) => column.trim());
  const linkedTasks = columns[3].split(',').map((id) => id.trim());
  const linkedTests = columns[4].split(',').map((id) => id.trim());
  if (!linkedTasks.some((id) => taskIds.has(id)))
    failures.push(`${reqId}: no existing TASK`);
  if (!linkedTests.some((id) => testIds.has(id)))
    failures.push(`${reqId}: no existing TEST`);
}

for (const row of testRows) {
  const refs = row[2].split(',').map((value) => value.trim());
  if (!refs.some((id) => reqIds.includes(id)))
    failures.push(`${row[1]}: test has no REQ reference`);
}
for (const row of traceRows) {
  const columns = row.split('|').map((column) => column.trim());
  const linkedTests = columns[4].split(',').map((id) => id.trim());
  for (const id of linkedTests)
    if (!testIds.has(id)) failures.push(`${columns[1]}: missing test ${id}`);
}

if (failures.length) {
  console.error(`Traceability check failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `Traceability check passed: ${reqIds.length} REQs map to existing TASKs and TESTs.`,
);
