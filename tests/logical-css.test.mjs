import test from 'node:test';
import assert from 'node:assert/strict';

const banned =
  /(?:^|[;{\s])(margin|padding)-(?:left|right)\s*:|(?:^|[;{\s])(?:left|right)\s*:/m;

test('logical CSS gate rejects physical left/right declarations', () => {
  assert.equal(banned.test('.card { margin-left: 1rem; }'), true);
  assert.equal(banned.test('.card { inset-inline-start: 1rem; }'), false);
});
