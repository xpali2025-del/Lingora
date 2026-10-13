import { normalizeContent } from './content-quality.mjs';

const MS_PER_DAY = 86_400_000;

/** Phrases that assert unverified facts. Applied to visible article copy. */
export const CLAIM_PATTERNS = [
  /\bofficial (re)?seller\b/iu,
  /\bauthori[sz]ed (re)?(seller|distributor)\b/iu,
  /\b(discount|promo|coupon) code\b/iu,
  /\bcoupon\b/iu,
  /موزع (معتمد|رسمي)/u,
  /كود خصم/u,
  /كوبون/u,
];

export function quarterOf(date) {
  const [year, month] = date.split('-').map(Number);
  return `${year}-Q${Math.ceil(month / 3)}`;
}

export function visibleText(record) {
  return [
    record.title,
    record.description,
    record.h1,
    record.intro,
    ...record.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
    ]),
    ...record.faqs.flatMap((faq) => [faq.question, faq.answer]),
  ].join(' ');
}

export function buildIntentRegistry(records) {
  return records
    .filter((record) => record.publicationState !== 'research-only')
    .map((record) => ({
      intentId: `${record.locale}:${record.route}`,
      locale: record.locale,
      route: record.route,
      primaryKeyword: record.keywordResearch.primaryKeyword,
      angle: record.angle ?? null,
    }))
    .sort((a, b) => a.intentId.localeCompare(b.intentId));
}

function headingSkeleton(record, locale) {
  return new Set(
    record.sections.map((section) => normalizeContent(section.heading, locale)),
  );
}

/** D1, D2, D4, D5, D6, D8, D9. Returns an array of failure strings. */
export function checkGovernance(records, { today, maxReviewAgeDays = 90 }) {
  const failures = [];
  const live = records.filter((r) => r.publicationState !== 'research-only');
  const articles = live.filter((r) => r.pageType === 'article');

  // D1: one owner per primary intent per locale.
  const primaries = new Map();
  for (const record of live) {
    const key = `${record.locale}:${normalizeContent(record.keywordResearch.primaryKeyword, record.locale)}`;
    if (primaries.has(key))
      failures.push(
        `D1 ${record.locale}:${record.route}: primary keyword already owned by ${primaries.get(key)}.`,
      );
    else primaries.set(key, `${record.locale}:${record.route}`);
  }

  // D2: an angle is used once per locale.
  const angles = new Map();
  for (const article of articles) {
    const key = `${article.locale}:${article.angle}`;
    if (angles.has(key))
      failures.push(
        `D2 ${article.locale}:${article.route}: angle "${article.angle}" already used by ${angles.get(key)}.`,
      );
    else angles.set(key, `${article.locale}:${article.route}`);
  }

  // D4: unique facts must not repeat across articles in a locale.
  const facts = new Map();
  for (const article of articles)
    for (const fact of article.uniqueFacts ?? []) {
      const key = `${article.locale}:${normalizeContent(fact.fact, article.locale)}`;
      if (facts.has(key))
        failures.push(
          `D4 ${article.locale}:${article.route}: unique fact repeats ${facts.get(key)}.`,
        );
      else facts.set(key, `${article.locale}:${article.route}`);
    }

  // D5: one article per country per quarter per locale.
  const countries = new Map();
  for (const article of articles) {
    if (!article.localHook || !article.datePublished) continue;
    const key = `${article.locale}:${article.localHook.country}:${quarterOf(article.datePublished)}`;
    if (countries.has(key))
      failures.push(
        `D5 ${article.locale}:${article.route}: country ${article.localHook.country} already covered this quarter by ${countries.get(key)}.`,
      );
    else countries.set(key, `${article.locale}:${article.route}`);
  }

  // D6: heading skeletons must differ.
  for (let i = 0; i < articles.length; i += 1)
    for (let j = i + 1; j < articles.length; j += 1) {
      const a = articles[i];
      const b = articles[j];
      if (a.locale !== b.locale) continue;
      const left = headingSkeleton(a, a.locale);
      const right = headingSkeleton(b, b.locale);
      const shared = [...left].filter((h) => right.has(h)).length;
      const share = shared / Math.max(1, Math.min(left.size, right.size));
      if (left.size >= 3 && share >= 0.8)
        failures.push(
          `D6 ${a.locale}:${a.route} and ${b.route}: ${Math.round(share * 100)}% identical headings.`,
        );
    }

  // D8: unverified claims never appear in article copy.
  for (const article of articles) {
    const text = visibleText(article);
    for (const pattern of CLAIM_PATTERNS)
      if (pattern.test(text))
        failures.push(
          `D8 ${article.locale}:${article.route}: restricted claim matches ${pattern}.`,
        );
  }

  // D9: indexable articles need a recent verification and a native review.
  for (const article of articles) {
    if (!article.indexable) continue;
    if (!article.reviewedBy)
      failures.push(`D9 ${article.locale}:${article.route}: no native review.`);
    const age =
      (Date.parse(today) - Date.parse(article.lastVerified)) / MS_PER_DAY;
    if (!(age <= maxReviewAgeDays))
      failures.push(
        `D9 ${article.locale}:${article.route}: lastVerified is older than ${maxReviewAgeDays} days.`,
      );
  }
  return failures;
}

export function checkMarkets(markets, localeConfig) {
  const failures = [];
  const trackCodes = new Set(localeConfig.map((locale) => locale.code));
  const seen = new Set();
  for (const market of markets.markets ?? []) {
    const label = `market ${market.country}`;
    if (!/^[A-Z]{2}$/u.test(market.country ?? ''))
      failures.push(`${label}: country must be an ISO 3166-1 alpha-2 code.`);
    if (seen.has(market.country)) failures.push(`${label}: duplicate market.`);
    seen.add(market.country);
    if (!/^[A-Z]{3}$/u.test(market.currency ?? ''))
      failures.push(`${label}: currency must be an ISO 4217 code.`);
    for (const track of market.tracks ?? [])
      if (!trackCodes.has(track))
        failures.push(`${label}: unknown language track "${track}".`);
    if (!market.tracks?.length)
      failures.push(`${label}: needs at least one language track.`);
    if (market.paymentRails !== null && !market.lastVerified)
      failures.push(`${label}: payment rails need a lastVerified date.`);
  }
  for (const locale of localeConfig)
    for (const code of locale.markets)
      if (!seen.has(code))
        failures.push(
          `locale ${locale.code}: market ${code} missing from markets.json.`,
        );
  return failures;
}
