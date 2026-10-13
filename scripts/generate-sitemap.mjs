import { writeFileSync } from 'node:fs';
import { alternatesFor } from '../src/lib/hreflang.mjs';
import { loadAllRecords } from '../src/lib/load-content.mjs';

const SITE = 'https://lingora.com';
const records = loadAllRecords().filter(
  (record) => record.publicationState !== 'research-only',
);
const indexable = records
  .filter((record) => record.indexable)
  .sort((a, b) => a.route.localeCompare(b.route));

const entries = indexable.map((record) => {
  const alternates = alternatesFor(record, records);
  const links = alternates
    ? Object.entries(alternates)
        .map(
          ([language, route]) =>
            `    <xhtml:link rel="alternate" hreflang="${language}" href="${SITE}${route}" />`,
        )
        .join('\n')
    : '';
  const lastmod = record.dateModified ?? record.lastVerified;
  return `  <url>\n    <loc>${SITE}${record.route}</loc>\n    <lastmod>${lastmod}</lastmod>${links ? `\n${links}` : ''}\n  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
writeFileSync('out/sitemap.xml', xml);
console.log(`Generated sitemap with ${indexable.length} indexable URLs.`);
