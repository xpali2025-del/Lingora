import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ContentRecordSchema, type ContentRecord } from './content-schema';

export type Locale = 'ar' | 'en';

export function getAllContent(
  locale: Locale,
  options: { includeResearchOnly?: boolean } = {},
): ContentRecord[] {
  const directory = join(process.cwd(), 'content', locale);
  return readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const raw = JSON.parse(
        readFileSync(join(directory, file), 'utf8'),
      ) as unknown;
      const parsed = ContentRecordSchema.parse(raw);
      if (parsed.locale !== locale) {
        throw new Error(
          `${file}: locale mismatch (expected ${locale}, found ${parsed.locale})`,
        );
      }
      return parsed;
    })
    .filter(
      (record) =>
        options.includeResearchOnly === true ||
        record.publicationState !== 'research-only',
    )
    .sort((a, b) => a.route.localeCompare(b.route));
}

export function getContentByRoute(
  locale: Locale,
  route: string,
): ContentRecord {
  const match = getAllContent(locale).find((record) => record.route === route);
  if (!match) throw new Error(`No ${locale} content record found for ${route}`);
  return match;
}

export function getDynamicSlugs(
  locale: Locale,
  reserved: string[],
): { slug: string }[] {
  return getAllContent(locale)
    .map((record) => record.route.split('/').filter(Boolean))
    .map((segments) =>
      locale === 'en' && segments[0] === 'en' ? segments.slice(1) : segments,
    )
    .filter(
      (segments) => segments.length === 1 && !reserved.includes(segments[0]),
    )
    .map(([slug]) => ({ slug }));
}

export function countWords(record: ContentRecord): number {
  const text = [
    record.h1,
    record.intro,
    ...record.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
    ]),
    ...record.faqs.flatMap((faq) => [faq.question, faq.answer]),
    ...(record.paymentOptions ?? []).flatMap((option) => [
      option.group,
      option.label,
      option.value,
      option.details,
    ]),
  ].join(' ');
  return text.trim().split(/\s+/u).filter(Boolean).length;
}
