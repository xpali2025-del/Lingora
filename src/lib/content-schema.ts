import { z } from 'zod';

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
    locale: z.enum(['ar', 'en']),
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
    ]),
    publicationState: z.enum(['draft', 'research-only']),
    searchIntent: z.object({
      stage: z.string().min(1),
      userNeed: z.string().min(1),
      pageJob: z.string().min(1),
      distinctFrom: z.string().min(1),
      researchStatus: z.enum(['proposed', 'source-backed', 'blocked']),
    }),
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
