import test from 'node:test';
import assert from 'node:assert/strict';
import {
  containmentSimilarity,
  fiveWordShingles,
  keywordDensities,
  normalizeContent,
} from '../src/lib/content-quality.mjs';

test('Arabic normalization removes marks and unifies alef, ya, and ta marbuta', () => {
  assert.equal(
    normalizeContent('إِشتراكٌ دُوولينجو ة', 'ar'),
    normalizeContent('اشتراك دوولينجو ه', 'ar'),
  );
});

test('five-word shingle containment flags a copied passage', () => {
  const original = fiveWordShingles(
    'A calm learner can review the link details before making a careful choice.',
    'en',
  );
  const copied = fiveWordShingles(
    'A calm learner can review the link details before making a careful choice today.',
    'en',
  );
  assert.ok(containmentSimilarity(original, copied) >= 0.25);
});

test('unrelated passages remain below the watch threshold', () => {
  const first = fiveWordShingles(
    'A thoughtful reader compares the listed terms and documented redemption source.',
    'en',
  );
  const second = fiveWordShingles(
    'Choose a small daily habit and record progress in a personal learning journal.',
    'en',
  );
  assert.ok(containmentSimilarity(first, second) < 0.15);
});

test('keyword density detects stuffing while allowing primary terms to be excluded', () => {
  const flagged = keywordDensities(
    'repeat repeat repeat repeat phrase unique words across this short paragraph',
    'en',
  );
  assert.ok(flagged.find((entry) => entry.term === 'repeat')?.density > 0.025);

  const excluded = keywordDensities(
    'payment payment payment payment details vary by country and provider',
    'en',
    ['payment'],
  );
  assert.equal(
    excluded.some((entry) => entry.term === 'payment'),
    false,
  );
});
