import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const records = [];
for (const locale of ['ar', 'en']) {
  const contentDir = join('content', locale);
  for (const file of readdirSync(contentDir).filter((name) =>
    name.endsWith('.json'),
  )) {
    records.push(JSON.parse(readFileSync(join(contentDir, file), 'utf8')));
  }
}
const publicDrafts = records.filter(
  (record) => record.publicationState !== 'research-only',
);
const researchOnly = records.filter(
  (record) => record.publicationState === 'research-only',
);
const failures = [];
if (publicDrafts.length !== 14)
  failures.push(
    `Expected 14 public draft routes; found ${publicDrafts.length}.`,
  );
if (researchOnly.length !== 12)
  failures.push(
    `Expected 12 withheld market records; found ${researchOnly.length}.`,
  );
for (const record of publicDrafts) {
  const outputPath = record.route.endsWith('/')
    ? record.route
    : `${record.route}/`;
  const relativePath =
    outputPath === '/' ? 'index.html' : `${outputPath.slice(1)}index.html`;
  const filePath = join('out', relativePath);
  const label = `${record.locale}:${record.route}`;
  if (!existsSync(filePath)) {
    failures.push(`${label}: missing exported route ${filePath}`);
    continue;
  }
  const html = readFileSync(filePath, 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '';
  const description =
    html.match(
      /<meta\s+name="description"\s+content="([\s\S]*?)"\s*\/?\s*>/i,
    )?.[1] ?? '';
  const canonical =
    html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] ?? '';
  const robots =
    html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] ?? '';
  const htmlTag = html.match(/<html\b([^>]*)>/i)?.[1] ?? '';
  const headingCount = [...html.matchAll(/<h1\b/gi)].length;
  const titleText = title.replace(/&amp;/gu, '&').replace(/&#x27;/giu, "'");
  const descriptionText = description
    .replace(/&amp;/gu, '&')
    .replace(/&#x27;/giu, "'");
  if (!htmlTag.includes(`lang="${record.locale}"`))
    failures.push(`${label}: wrong lang attribute.`);
  if (!htmlTag.includes(`dir="${record.locale === 'ar' ? 'rtl' : 'ltr'}"`))
    failures.push(`${label}: wrong direction attribute.`);
  if (headingCount !== 1)
    failures.push(`${label}: expected one H1, found ${headingCount}.`);
  if (titleText.length < 45 || titleText.length > 60)
    failures.push(
      `${label}: rendered title has ${titleText.length} characters.`,
    );
  if (descriptionText.length < 120 || descriptionText.length > 155)
    failures.push(
      `${label}: rendered description has ${descriptionText.length} characters.`,
    );
  if (canonical !== `https://lingora.com${record.route}`)
    failures.push(`${label}: incorrect canonical ${canonical}.`);
  if (record.indexable) {
    for (const [language, href] of [
      ['ar', 'https://lingora.com/about/'],
      ['en', 'https://lingora.com/en/about/'],
      ['x-default', 'https://lingora.com/'],
    ]) {
      const alternatePattern = new RegExp(
        `<link[^>]*rel="alternate"[^>]*hreflang="${language}"[^>]*href="${href}"`,
        'i',
      );
      if (!alternatePattern.test(html))
        failures.push(`${label}: missing reciprocal ${language} hreflang.`);
    }
  }
  if (record.indexable) {
    if (
      robots.includes('noindex') ||
      robots.includes('nofollow') ||
      !robots.includes('index') ||
      !robots.includes('follow')
    )
      failures.push(
        `${label}: indexable route must allow indexing and following.`,
      );
  } else if (!robots.includes('noindex') || !robots.includes('nofollow')) {
    failures.push(
      `${label}: blocked draft route must remain noindex,nofollow.`,
    );
  }
  const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map(
    (match) => match[0],
  );
  for (const [imageIndex, imageTag] of imageTags.entries()) {
    const alt = imageTag.match(/\balt="([^"]*)"/i)?.[1]?.trim() ?? '';
    if (alt.length < 20)
      failures.push(
        `${label}: image ${imageIndex + 1} must have descriptive alt text (20+ characters).`,
      );
  }
  if (record.paymentOptions) {
    for (const option of record.paymentOptions) {
      if (!html.includes(option.value))
        failures.push(
          `${label}: payment option value is missing from rendered HTML.`,
        );
    }
  }
  if (/<script\b|<link\b(?=[^>]*\bas=["']script["'])/i.test(html))
    failures.push(
      `${label}: unnecessary client script found in static draft page.`,
    );
}
for (const record of researchOnly) {
  const route = record.route.endsWith('/') ? record.route : `${record.route}/`;
  const relativePath =
    route === '/' ? 'index.html' : `${route.slice(1)}index.html`;
  if (existsSync(join('out', relativePath)))
    failures.push(
      `${record.locale}:${record.route}: research-only route was exported; keep it withheld until local evidence passes review.`,
    );
}
if (
  researchOnly.length &&
  researchOnly.some((record) => record.indexable !== false)
)
  failures.push('Every research-only record must remain non-indexable.');

const expectedSitemapUrls = publicDrafts
  .filter((record) => record.indexable)
  .map((record) => `https://lingora.com${record.route}`)
  .sort();
const sitemapPath = 'out/sitemap.xml';
const robotsPath = 'out/robots.txt';
if (!existsSync(sitemapPath)) {
  failures.push('out/sitemap.xml: missing indexable route sitemap.');
} else {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/giu)]
    .map((match) => match[1])
    .sort();
  if (JSON.stringify(sitemapUrls) !== JSON.stringify(expectedSitemapUrls))
    failures.push(
      `Sitemap URLs must match indexable content routes exactly; expected ${expectedSitemapUrls.join(', ')}, found ${sitemapUrls.join(', ')}.`,
    );
}
if (!existsSync(robotsPath)) {
  failures.push('out/robots.txt: missing crawler instructions.');
} else {
  const robots = readFileSync(robotsPath, 'utf8');
  if (
    !robots.includes('Disallow: /api/') ||
    !robots.includes('Disallow: /admin/')
  )
    failures.push('robots.txt must disallow /api/ and /admin/.');
  if (!robots.includes('Sitemap: https://lingora.com/sitemap.xml'))
    failures.push('robots.txt must reference the site sitemap.');
}

if (failures.length) {
  console.error(
    `Content export verification failed:\n- ${failures.join('\n- ')}`,
  );
  process.exit(1);
}
console.log(
  `Content export verified: ${publicDrafts.length} routes served (${publicDrafts.filter((record) => record.indexable).length} indexable); ${researchOnly.length} market routes withheld; robots directives, sitemap, metadata, locale/dir, and canonicals pass.`,
);
