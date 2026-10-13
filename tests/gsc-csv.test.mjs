import test from 'node:test';
import assert from 'node:assert/strict';
import { field, numericMetric, parseCsv } from '../src/lib/gsc-csv.mjs';

test('parses UTF-8 BOM, quoted commas, and escaped quotes from Search Console CSV', () => {
  const rows = parseCsv(
    '\uFEFFTop queries,Clicks,Impressions,CTR,Position\r\n"learn, daily",12,240,5%,8.4\r\n"say ""hello""",2,20,10%,4',
  );
  assert.equal(rows.length, 2);
  assert.equal(field(rows[0], ['query', 'top queries']), 'learn, daily');
  assert.equal(field(rows[1], ['top queries']), 'say "hello"');
  assert.equal(numericMetric(field(rows[0], ['impressions'])), 240);
});

test('supports Arabic Search Console column labels', () => {
  const rows = parseCsv(
    'طلبات البحث الرئيسية,النقرات,مرات الظهور,نسبة النقر إلى الظهور,الموضع\nاشتراك لغة,8,120,6.7%,9.2',
  );
  assert.equal(
    field(rows[0], ['top queries', 'طلبات البحث الرئيسية']),
    'اشتراك لغة',
  );
  assert.equal(numericMetric(field(rows[0], ['الموضع'])), 9.2);
});
