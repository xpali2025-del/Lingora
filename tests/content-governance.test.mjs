import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkGovernance,
  checkMarkets,
  quarterOf,
} from '../src/lib/content-governance.mjs';
import { alternatesFor } from '../src/lib/hreflang.mjs';

const today = '2026-10-13';
function article(overrides = {}) {
  return {
    locale: 'en',
    route: '/en/blog/a/',
    pageType: 'article',
    publicationState: 'draft',
    indexable: false,
    lastVerified: '2026-10-01',
    title: 'T',
    description: 'D',
    h1: 'H',
    intro: 'Intro text.',
    sections: [
      { heading: 'One', paragraphs: ['x'] },
      { heading: 'Two', paragraphs: ['x'] },
      { heading: 'Three', paragraphs: ['x'] },
    ],
    faqs: [],
    angle: 'exam-prep',
    datePublished: '2026-10-05',
    localHook: { country: 'KE', description: 'Exam' },
    uniqueFacts: [{ fact: 'Fact A one' }, { fact: 'Fact B two' }],
    keywordResearch: { primaryKeyword: 'ielts kenya' },
    ...overrides,
  };
}
const run = (records) => checkGovernance(records, { today });

test('clean articles produce no failures', () => {
  const b = article({
    route: '/en/blog/b/',
    angle: 'workplace',
    localHook: { country: 'ZA', description: 'Work' },
    uniqueFacts: [{ fact: 'Fact C three' }],
    keywordResearch: { primaryKeyword: 'work english south africa' },
    sections: [
      { heading: 'Alpha', paragraphs: ['x'] },
      { heading: 'Beta', paragraphs: ['x'] },
      { heading: 'Gamma', paragraphs: ['x'] },
    ],
  });
  assert.deepEqual(run([article(), b]), []);
});

test('D1 duplicate primary keyword, D2 repeated angle, D5 country cap', () => {
  const b = article({ route: '/en/blog/b/' });
  const failures = run([article(), b]);
  assert.ok(failures.some((f) => f.startsWith('D1')));
  assert.ok(failures.some((f) => f.startsWith('D2')));
  assert.ok(failures.some((f) => f.startsWith('D5')));
});

test('D4 repeated unique facts and D6 identical heading skeletons', () => {
  const b = article({
    route: '/en/blog/b/',
    angle: 'workplace',
    localHook: { country: 'ZA', description: 'Work' },
    keywordResearch: { primaryKeyword: 'other' },
  });
  const failures = run([article(), b]);
  assert.ok(failures.some((f) => f.startsWith('D4')));
  assert.ok(failures.some((f) => f.startsWith('D6')));
});

test('D8 blocks unverified claims in article copy', () => {
  const failures = run([article({ intro: 'Use our discount code today.' })]);
  assert.ok(failures.some((f) => f.startsWith('D8')));
  const arabic = run([article({ locale: 'ar', intro: 'احصل على كود خصم' })]);
  assert.ok(arabic.some((f) => f.startsWith('D8')));
});

test('D9 requires review and fresh verification for indexable articles', () => {
  const failures = run([
    article({ indexable: true, lastVerified: '2026-01-01' }),
  ]);
  assert.equal(failures.filter((f) => f.startsWith('D9')).length, 2);
});

test('research-only records are ignored by governance', () => {
  assert.deepEqual(
    run([article({ publicationState: 'research-only', intro: 'coupon' })]),
    [],
  );
});

test('quarterOf groups months into quarters', () => {
  assert.equal(quarterOf('2026-10-13'), '2026-Q4');
  assert.equal(quarterOf('2026-03-31'), '2026-Q1');
});

test('hreflang pairs by group and by legacy route heuristic', () => {
  const ar = { locale: 'ar', route: '/about/', indexable: true };
  const en = { locale: 'en', route: '/en/about/', indexable: true };
  assert.deepEqual(alternatesFor(ar, [ar, en]), {
    ar: '/about/',
    en: '/en/about/',
    'x-default': '/',
  });
  const fr = {
    locale: 'fr',
    route: '/fr/a/',
    indexable: true,
    hreflangGroup: 'g',
  };
  const en2 = {
    locale: 'en',
    route: '/en/blog/a/',
    indexable: true,
    hreflangGroup: 'g',
  };
  assert.deepEqual(alternatesFor(fr, [fr, en2]), {
    fr: '/fr/a/',
    en: '/en/blog/a/',
    'x-default': '/',
  });
  assert.equal(alternatesFor({ ...ar, indexable: false }, [ar, en]), null);
  assert.equal(alternatesFor(ar, [ar, { ...en, indexable: false }]), null);
});

test('markets validation catches bad codes and unverified rails', () => {
  const locales = [{ code: 'en', markets: ['GB'] }];
  const ok = {
    markets: [
      { country: 'GB', currency: 'GBP', tracks: ['en'], paymentRails: null },
    ],
  };
  assert.deepEqual(checkMarkets(ok, locales), []);
  const bad = {
    markets: [
      {
        country: 'GB',
        currency: 'pound',
        tracks: ['xx'],
        paymentRails: ['card'],
      },
    ],
  };
  assert.equal(checkMarkets(bad, locales).length, 3);
});
