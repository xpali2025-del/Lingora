import { z } from 'zod';
import { ALL_LOCALE_CODES, ANGLE_IDS } from '@/i18n/locales';

const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u);

const KeywordResearchSchema = z.object({
  status: z.string().min(1),
  primaryKeyword: z.string().min(1),
  shortTail: z.array(z.string().min(1)),
  longTail: z.array(z.string().min(1)),
  synonyms: z.array(z.string().min(1)).optional(),
  semanticTerms: z.array(z.string().min(1)).optional(),
  restrictedTerms: z.array(z.string().min(1)).optional(),
  volume: z.number().nonnegative().nullable(),
  difficulty: z.number().min(0).max(100).nullable(),
  searchConsole: z.object({
    clicks: z.number().nonnegative().nullable(),
    impressions: z.number().nonnegative().nullable(),
    ctr: z.number().min(0).max(1).nullable(),
    position: z.number().positive().nullable(),
  }),
  source: z.string().min(1),
});

export const ContentRecordSchema = z
  .object({
    slug: z.string().min(1),
    locale: z.enum(ALL_LOCALE_CODES),
    route: z.string().startsWith('/'),
    intentType: z.string().min(1),
    lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
    verificationStatus: z.string().min(1),
    sourcesChecked: z.array(z.string().min(1)).min(1),
    pageType: z.enum([
      'home',
      'plans',
      'about',
      'policy',
      'payments',
      'market-hub',
      'article',
      'blog-index',
    ]),
    publicationState: z.enum(['draft', 'research-only']),
    searchIntent: z.object({
      stage: z.string().min(1),
      userNeed: z.string().min(1),
      pageJob: z.string().min(1),
      distinctFrom: z.string().min(1),
      researchStatus: z.enum(['proposed', 'source-backed', 'blocked']),
    }),
    hreflangGroup: z.string().min(1).optional(),
    sourceMode: z.enum(['original', 'transcreated']).optional(),
    angle: z.enum(ANGLE_IDS).optional(),
    localHook: z
      .object({ country: z.string().length(2), description: z.string().min(1) })
      .optional(),
    uniqueFacts: z
      .array(
        z.object({
          fact: z.string().min(1),
          sourceUrl: z.url(),
          checked: DateString,
        }),
      )
      .optional(),
    sources: z.array(z.url()).optional(),
    reviewedBy: z
      .object({
        role: z.enum(['native-editor']),
        name: z.string().min(1),
        date: DateString,
      })
      .optional(),
    author: z.string().min(1).optional(),
    datePublished: DateString.optional(),
    dateModified: DateString.optional(),
    status: z.string().min(1),
    indexable: z.boolean(),
    targetWords: z.number().positive(),
    title: z.string().min(1),
    description: z.string().min(1),
    keywordResearch: KeywordResearchSchema,
    h1: z.string().min(1),
    intro: z.string().min(1),
    sections: z
      .array(
        z.object({
          heading: z.string().min(1),
          paragraphs: z.array(z.string().min(1)).min(1),
        }),
      )
      .min(1),
    faqs: z.array(
      z.object({ question: z.string().min(1), answer: z.string().min(1) }),
    ),
    publishBlockers: z.array(z.string().min(1)),
    paymentOptions: z
      .array(
        z.object({
          group: z.string().min(1),
          label: z.string().min(1),
          value: z.string().min(1),
          details: z.string().min(1),
        }),
      )
      .optional(),
  })
  .superRefine((record, context) => {
    if (record.pageType === 'article') {
      for (const key of [
        'angle',
        'localHook',
        'sourceMode',
        'author',
        'datePublished',
      ] as const) {
        if (!record[key])
          context.addIssue({
            code: 'custom',
            path: [key],
            message: `Articles must define ${key}.`,
          });
      }
      if ((record.uniqueFacts?.length ?? 0) < 3)
        context.addIssue({
          code: 'custom',
          path: ['uniqueFacts'],
          message: 'Articles need at least 3 sourced unique facts.',
        });
      if (!record.sources?.length)
        context.addIssue({
          code: 'custom',
          path: ['sources'],
          message: 'Articles must cite at least one primary source.',
        });
      if (record.indexable && !record.reviewedBy)
        context.addIssue({
          code: 'custom',
          path: ['reviewedBy'],
          message: 'Indexable articles require a native-editor review.',
        });
    }
    if (
      record.pageType === 'market-hub' &&
      record.publicationState === 'draft' &&
      (record.uniqueFacts?.length ?? 0) < 5
    )
      context.addIssue({
        code: 'custom',
        path: ['uniqueFacts'],
        message:
          'A published country hub needs at least 5 sourced unique facts.',
      });
    if (record.pageType === 'payments' && !record.paymentOptions?.length) {
      context.addIssue({
        code: 'custom',
        path: ['paymentOptions'],
        message:
          'Payment pages must define at least one structured payment option.',
      });
    }
  });

export type ContentRecord = z.infer<typeof ContentRecordSchema>;
