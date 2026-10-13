import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  containmentSimilarity,
  contentText,
  fiveWordShingles,
  keywordDensities,
  normalizeContent,
} from '../src/lib/content-quality.mjs';

const root = 'content';
const productFacts = JSON.parse(
  readFileSync(join(root, 'product-facts.json'), 'utf8'),
);
const records = [];
for (const locale of ['ar', 'en']) {
  for (const file of readdirSync(join(root, locale)).filter((name) =>
    name.endsWith('.json'),
  )) {
    records.push(JSON.parse(readFileSync(join(root, locale, file), 'utf8')));
  }
}
const publicDrafts = records.filter(
  (record) => record.publicationState !== 'research-only',
);
const researchOnly = records.filter(
  (record) => record.publicationState === 'research-only',
);
const failures = [];
const watches = [];
const primaryOwners = new Map();
const titleOwners = new Map();
const descriptionOwners = new Map();
const faqOwners = new Map();
const stopWords = {
  ar: new Set(
    'في من على الى إلى عن ما هو هي ان أن او أو و لا هذا هذه ذلك تلك الذي التي الذين كان كانت يكون تكون كل بعض اي أي عند بعد قبل مع بين حتى قد لم لن مثل غير أكثر اقل أقل هنا هناك مااذا اذا إذا به بها له لها عنه فيها عليها وذلك لذلك حيث حيثما مجرد ايضا أيضًا لكن فان فإن اوضح معظم يمكن يجب ينبغي لايزال يزال صفحه الصفحه البيانات المستفيد'.split(
      /\s+/u,
    ),
  ),
  en: new Set(
    'the a an and or but if then than to of in on at for from with by about as is are was were be been being it its this that these those there here what which who how when where why can could should would may might must do does did not no yes have has had before after between into through during over under more most less each every any all some such only also very page pages offer source supplied wallet wallets data beneficiary'.split(
      /\s+/u,
    ),
  ),
};

if (records.length !== 26)
  failures.push(`Expected 26 source records; found ${records.length}.`);
if (publicDrafts.length !== 14)
  failures.push(
    `Expected 14 reviewed draft routes; found ${publicDrafts.length}.`,
  );
if (researchOnly.length !== 12)
  failures.push(
    `Expected 12 quarantined market records; found ${researchOnly.length}.`,
  );

for (const record of records) {
  const { locale, route, title, description, h1, keywordResearch } = record;
  const page = `${locale}:${route}`;
  const intent = record.searchIntent;
  if (record.publicationState !== 'research-only') {
    const synonyms = keywordResearch.synonyms ?? [];
    const semanticTerms = keywordResearch.semanticTerms ?? [];
    if (synonyms.length < 3 || semanticTerms.length < 3)
      failures.push(
        `${page}: add at least 3 synonyms and 3 semantic terms to keywordResearch.`,
      );
    const visibleText = [
      record.title,
      record.description,
      record.h1,
      record.intro,
      ...record.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
      ...record.faqs.flatMap((f) => [f.question, f.answer]),
    ]
      .join(' ')
      .toLowerCase();
    for (const term of keywordResearch.restrictedTerms ?? [])
      if (visibleText.includes(term.toLowerCase()))
        failures.push(
          `${page}: restricted term "${term}" must not appear in visible copy.`,
        );
    const seen = new Set();
    for (const term of [keywordResearch.primaryKeyword, ...synonyms]) {
      const key = term.trim().toLowerCase();
      if (seen.has(key))
        failures.push(`${page}: duplicate keyword variant "${term}".`);
      seen.add(key);
    }
  }
  const intendedIndexableAbout =
    (locale === 'ar' && route === '/about/') ||
    (locale === 'en' && route === '/en/about/');
  if (record.indexable !== intendedIndexableAbout)
    failures.push(
      `${page}: only the owner-approved bilingual About pages may be indexable.`,
    );
  if (
    !intent?.stage ||
    !intent?.userNeed ||
    !intent?.pageJob ||
    !intent?.distinctFrom
  )
    failures.push(
      `${page}: search intent must define stage, user need, page job and non-overlap.`,
    );
  if (title.length < 45 || title.length > 60)
    failures.push(`${page}: title length ${title.length} is outside 45–60.`);
  if (description.length < 120 || description.length > 155)
    failures.push(
      `${page}: description length ${description.length} is outside 120–155.`,
    );
  if (!title.trim().endsWith('| Lingora'))
    failures.push(`${page}: brand must appear last in the title.`);

  if (record.publicationState === 'research-only') {
    if (record.pageType !== 'market-hub')
      failures.push(
        `${page}: only market pages may be research-only in this change.`,
      );
    if (intent?.researchStatus !== 'blocked')
      failures.push(`${page}: market page lacks blocked research status.`);
    if (
      !record.publishBlockers.some((blocker) => /unique|فريدة/iu.test(blocker))
    )
      failures.push(
        `${page}: withheld market page must document the unique-local-evidence blocker.`,
      );
    continue;
  }
  if (record.pageType === 'market-hub')
    failures.push(
      `${page}: do not serve a market hub without approved unique local evidence.`,
    );

  const titleKey = `${locale}:${normalizeContent(title, locale)}`;
  const descriptionKey = `${locale}:${normalizeContent(description, locale)}`;
  if (titleOwners.has(titleKey))
    failures.push(`${page}: title duplicates ${titleOwners.get(titleKey)}.`);
  else titleOwners.set(titleKey, page);
  if (descriptionOwners.has(descriptionKey))
    failures.push(
      `${page}: description duplicates ${descriptionOwners.get(descriptionKey)}.`,
    );
  else descriptionOwners.set(descriptionKey, page);

  const primary = normalizeContent(keywordResearch.primaryKeyword, locale);
  if (!normalizeContent(title, locale).includes(primary))
    failures.push(`${page}: primary phrase missing from title.`);
  if (!normalizeContent(h1, locale).includes(primary))
    failures.push(`${page}: primary phrase missing from H1.`);
  const sharedProductEvidence =
    record.pageType === 'plans'
      ? [
          productFacts[locale].heading,
          ...productFacts[locale].facts,
          productFacts[locale].note,
        ]
      : [];
  const visibleText = [
    h1,
    record.intro,
    ...record.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
    ]),
    ...record.faqs.flatMap((faq) => [faq.question, faq.answer]),
    ...sharedProductEvidence,
    ...(record.paymentOptions ?? []).flatMap((option) => [
      option.group,
      option.label,
      option.value,
      option.details,
    ]),
  ].join(' ');
  const normalizedVisible = normalizeContent(visibleText, locale);
  if (record.pageType === 'about' && record.indexable) {
    for (const contact of [
      '+966554751363',
      'info@lingora.com',
      'sales@lingora.com',
    ]) {
      if (!visibleText.includes(contact))
        failures.push(`${page}: indexable About page is missing ${contact}.`);
    }
  }
  const ignoredTerms = [
    ...stopWords[locale],
    'Lingora',
    'Duolingo',
    'Super',
    'USDT',
    'BEP20',
    ...keywordResearch.primaryKeyword.split(/\s+/u),
  ];
  for (const { term, count, density } of keywordDensities(
    visibleText,
    locale,
    ignoredTerms,
  )) {
    if (count >= 4 && density > 0.025)
      failures.push(
        `${page}: keyword-stuffing risk: “${term}” occurs at ${(density * 100).toFixed(1)}% density (max 2.5%).`,
      );
  }
  const firstHundred = visibleText.split(/\s+/u).slice(0, 100).join(' ');
  if (!normalizeContent(firstHundred, locale).includes(primary))
    failures.push(`${page}: primary phrase missing from first 100 words.`);
  const primaryUses = normalizedVisible.split(primary).length - 1;
  if (primaryUses > 3)
    failures.push(
      `${page}: exact primary phrase appears ${primaryUses} times (max 3 body uses).`,
    );

  const ownerKey = `${locale}:${primary}`;
  if (primaryOwners.has(ownerKey))
    failures.push(
      `${page}: primary phrase also owned by ${primaryOwners.get(ownerKey)}.`,
    );
  else primaryOwners.set(ownerKey, page);

  for (const faq of record.faqs) {
    const question = normalizeContent(faq.question, locale);
    if (faqOwners.has(`${locale}:${question}`))
      failures.push(
        `${page}: duplicate FAQ question also used on ${faqOwners.get(`${locale}:${question}`)}.`,
      );
    else faqOwners.set(`${locale}:${question}`, page);
  }
}

// Catch query cannibalization when one active page's multiword primary is almost a subset of another.
for (const locale of ['ar', 'en']) {
  const owned = publicDrafts
    .filter((record) => record.locale === locale)
    .map((record) => ({
      route: record.route,
      tokens: normalizeContent(record.keywordResearch.primaryKeyword, locale)
        .split(' ')
        .filter(Boolean),
    }));
  for (let left = 0; left < owned.length; left += 1) {
    for (let right = left + 1; right < owned.length; right += 1) {
      const a = new Set(owned[left].tokens);
      const b = new Set(owned[right].tokens);
      const smaller = Math.min(a.size, b.size);
      if (smaller < 2) continue;
      const overlap = [...a].filter((token) => b.has(token)).length / smaller;
      if (overlap >= 0.75)
        failures.push(
          `${locale} primary-keyword cannibalization risk: ${owned[left].route} ↔ ${owned[right].route} (${(overlap * 100).toFixed(0)}% token overlap).`,
        );
    }
  }
}

for (const locale of ['ar', 'en']) {
  const localized = records.filter((record) => record.locale === locale);
  const shingles = localized.map((record) => ({
    record,
    values: fiveWordShingles(contentText(record), locale),
  }));
  for (let left = 0; left < shingles.length; left += 1) {
    for (let right = left + 1; right < shingles.length; right += 1) {
      const score = containmentSimilarity(
        shingles[left].values,
        shingles[right].values,
      );
      const pages = `${shingles[left].record.route} ↔ ${shingles[right].record.route}`;
      if (score >= 0.25)
        failures.push(
          `${locale} near-duplicate ${pages}: ${(score * 100).toFixed(1)}% containment (FAIL ≥25%).`,
        );
      else if (score >= 0.15)
        watches.push(
          `${locale} similarity WATCH ${pages}: ${(score * 100).toFixed(1)}%.`,
        );
    }
  }
}

if (failures.length) {
  console.error(`Content quality gate failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `Content quality gate passed: ${publicDrafts.length} draft routes, ${publicDrafts.filter((record) => record.indexable).length} indexable About routes, ${researchOnly.length} market records withheld, ${primaryOwners.size} distinct active primary intents and ${faqOwners.size} unique FAQs.`,
);
for (const warning of watches) console.warn(warning);
for (const record of publicDrafts) {
  const sharedProductEvidence =
    record.pageType === 'plans'
      ? [
          productFacts[record.locale].heading,
          ...productFacts[record.locale].facts,
          productFacts[record.locale].note,
        ]
      : [];
  const words = [
    record.h1,
    record.intro,
    ...record.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
    ]),
    ...record.faqs.flatMap((faq) => [faq.question, faq.answer]),
    ...sharedProductEvidence,
    ...(record.paymentOptions ?? []).flatMap((option) => [
      option.group,
      option.label,
      option.value,
      option.details,
    ]),
  ]
    .join(' ')
    .trim()
    .split(/\s+/u)
    .filter(Boolean).length;
  if (words < record.targetWords)
    console.warn(
      `CONTENT COMPLETENESS DRAFT ${record.locale}:${record.route}: ${words}/${record.targetWords}; do not pad—resolve the page brief with verified material.`,
    );
}
