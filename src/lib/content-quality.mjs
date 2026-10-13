const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/gu;
const ARABIC_ALEF = /[أإآٱ]/gu;
const NON_WORD = /[^\p{L}\p{N}]+/gu;

export function normalizeContent(text, locale) {
  let normalized = text
    .normalize('NFKC')
    .toLocaleLowerCase(locale === 'ar' ? 'ar' : 'en');
  if (locale === 'ar') {
    normalized = normalized
      .replace(ARABIC_DIACRITICS, '')
      .replace(ARABIC_ALEF, 'ا')
      .replace(/[ىئ]/gu, 'ي')
      .replace(/ة/gu, 'ه');
  }
  return normalized.replace(NON_WORD, ' ').trim().replace(/\s+/gu, ' ');
}

export function fiveWordShingles(text, locale) {
  const words = normalizeContent(text, locale).split(' ').filter(Boolean);
  const shingles = new Set();
  for (let index = 0; index <= words.length - 5; index += 1) {
    shingles.add(words.slice(index, index + 5).join(' '));
  }
  return shingles;
}

export function containmentSimilarity(left, right) {
  if (left.size === 0 || right.size === 0) return 0;
  let overlap = 0;
  for (const shingle of left) if (right.has(shingle)) overlap += 1;
  return overlap / Math.min(left.size, right.size);
}

export function keywordDensities(text, locale, ignoredTerms = []) {
  const ignored = new Set(
    ignoredTerms.map((term) => normalizeContent(term, locale)).filter(Boolean),
  );
  const words = normalizeContent(text, locale)
    .split(' ')
    .filter((word) => word.length >= 3 && !ignored.has(word));
  const counts = new Map();
  for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
  return [...counts].map(([term, count]) => ({
    term,
    count,
    density: count / Math.max(words.length, 1),
  }));
}

export function contentText(record) {
  return [
    record.intro,
    ...record.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
    ]),
    ...(record.paymentOptions ?? []).flatMap((option) => [
      option.group,
      option.label,
      option.value,
      option.details,
    ]),
  ].join(' ');
}
