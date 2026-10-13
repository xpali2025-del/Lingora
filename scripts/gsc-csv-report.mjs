import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { field, numericMetric, parseCsv } from '../src/lib/gsc-csv.mjs';

const inputDir = 'data/search-console';
const outputDir = 'reports/search-console';
const exportNames = ['queries.csv', 'pages.csv', 'query-page.csv'];
const routeFiles = {
  ar: readdirSync('content/ar').filter((file) => file.endsWith('.json')),
  en: readdirSync('content/en').filter((file) => file.endsWith('.json')),
};
const routes = [];
for (const [locale, files] of Object.entries(routeFiles)) {
  for (const file of files) {
    const record = JSON.parse(
      readFileSync(join('content', locale, file), 'utf8'),
    );
    if (record.publicationState !== 'research-only') routes.push(record.route);
  }
}

function formatRow(row, keyAliases) {
  const key = field(row, keyAliases) || '(dimension label not recognized)';
  return `| ${key.replaceAll('|', '\\|')} | ${numericMetric(field(row, ['clicks', 'النقرات'])) ?? '—'} | ${numericMetric(field(row, ['impressions', 'مرات الظهور'])) ?? '—'} | ${field(row, ['ctr', 'نسبة النقر إلى الظهور']) || '—'} | ${numericMetric(field(row, ['position', 'average position', 'الموضع'])) ?? '—'} |`;
}

const existing = exportNames.filter((name) => existsSync(join(inputDir, name)));
if (!existing.length) {
  console.log(
    'No Search Console export found. Add queries.csv and pages.csv under data/search-console/ and rerun npm run seo:gsc. No live account access is configured.',
  );
  process.exit(0);
}

const queryRows = existsSync(join(inputDir, 'queries.csv'))
  ? parseCsv(readFileSync(join(inputDir, 'queries.csv'), 'utf8'))
  : [];
const pageRows = existsSync(join(inputDir, 'pages.csv'))
  ? parseCsv(readFileSync(join(inputDir, 'pages.csv'), 'utf8'))
  : [];
const queryPageRows = existsSync(join(inputDir, 'query-page.csv'))
  ? parseCsv(readFileSync(join(inputDir, 'query-page.csv'), 'utf8'))
  : [];
const topQueries = [...queryRows]
  .sort(
    (a, b) =>
      (numericMetric(field(b, ['impressions', 'مرات الظهور'])) ?? 0) -
      (numericMetric(field(a, ['impressions', 'مرات الظهور'])) ?? 0),
  )
  .slice(0, 100);
const topPages = [...pageRows]
  .sort(
    (a, b) =>
      (numericMetric(field(b, ['impressions', 'مرات الظهور'])) ?? 0) -
      (numericMetric(field(a, ['impressions', 'مرات الظهور'])) ?? 0),
  )
  .slice(0, 100);
const knownPages = new Set(
  topPages.map(
    (row) =>
      field(row, ['page', 'pages', 'top pages', 'الصفحات']).replace(
        /\/$/u,
        '',
      ) + '/',
  ),
);
const missingPages = routes.filter(
  (route) =>
    !knownPages.has(`https://lingora.com${route}`.replace(/\/$/u, '') + '/'),
);

const report = [
  '# Search Console Import Review',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '> Import only: these figures come from uploaded CSV exports; this script does not connect to Google Search Console.',
  '',
  `Source files: ${existing.join(', ')}`,
  `Mapped content routes in project: ${routes.length}`,
  '',
  '## Top queries by impressions',
  '',
  '| Query | Clicks | Impressions | CTR | Position |',
  '|---|---:|---:|---:|---:|',
  ...topQueries.map((row) =>
    formatRow(row, ['query', 'queries', 'top queries', 'طلبات البحث الرئيسية']),
  ),
  '',
  '## Top pages by impressions',
  '',
  '| Page | Clicks | Impressions | CTR | Position |',
  '|---|---:|---:|---:|---:|',
  ...topPages.map((row) =>
    formatRow(row, ['page', 'pages', 'top pages', 'الصفحات']),
  ),
  '',
  '## Content routes not found in the Pages export',
  '',
  ...(missingPages.length
    ? missingPages.map((route) => `- ${route}`)
    : ['- None.']),
  '',
  `## Query/page rows supplied: ${queryPageRows.length}`,
  '',
  queryPageRows.length
    ? 'Review this export manually to map real queries to a single page owner; do not auto-assign overlapping intents.'
    : 'No query-page dimension export was provided. Queries and Pages exports alone do not prove which query belongs to which page.',
  '',
].join('\n');

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'summary.md'), report);
console.log(
  `Search Console review written to ${outputDir}/summary.md from ${existing.length} uploaded export(s).`,
);
