import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { beforeEach, describe, test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { USDT_BSC } from '../src/server/bsc.mjs';
import { decryptCode, encryptCode } from '../src/server/codes-crypto.mjs';
import { readConfig } from '../src/server/config.mjs';
import { ensureSchema, fromPglite } from '../src/server/db.mjs';
import { handle } from '../src/server/handlers.mjs';
import { uniqueUsdtAmount, usdtToWei } from '../src/server/prices.mjs';

const ADDRESS = '0x1111111111111111111111111111111111111111';
const ADMIN = 'test-admin-token-0123456789abcdef';
const TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

let db;
let config;
let chain;

function fakeChain() {
  const state = {
    latest: 1000,
    receipts: new Map(),
    timestamp: Math.floor(Date.now() / 1000),
  };
  state.pay = (
    txHash,
    usdtAmount,
    { to = ADDRESS, block = 990, token = USDT_BSC, status = '0x1' } = {},
  ) =>
    state.receipts.set(txHash, {
      status,
      blockNumber: `0x${block.toString(16)}`,
      logs: [
        {
          address: token,
          topics: [
            TRANSFER_TOPIC,
            `0x${'2'.repeat(64)}`,
            `0x${to.slice(2).padStart(64, '0')}`,
          ],
          data: `0x${usdtToWei(usdtAmount).toString(16)}`,
        },
      ],
    });
  state.fetch = async (_url, init) => {
    const { method, params } = JSON.parse(init.body);
    const result =
      method === 'eth_getTransactionReceipt'
        ? (state.receipts.get(params[0]) ?? null)
        : method === 'eth_blockNumber'
          ? `0x${state.latest.toString(16)}`
          : { timestamp: `0x${state.timestamp.toString(16)}` };
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result }));
  };
  return state;
}

async function call(name, body, { method = 'POST', token, query = '' } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await handle(
    name,
    new Request(`http://localhost/api/${name}${query}`, {
      method,
      headers,
      body: method === 'GET' ? undefined : JSON.stringify(body),
    }),
    { db, config, fetchImpl: chain.fetch },
  );
  return { status: response.status, body: await response.json() };
}

const customer = {
  track: 'en',
  plan: 'individual',
  name: 'Sara Ahmed',
  email: 'Sara@Example.com',
  whatsapp: '+966 55 000 0000',
};

const txHash = (n) => `0x${n.toString(16).padStart(64, '0')}`;

beforeEach(async () => {
  db = await ensureSchema(fromPglite(new PGlite()));
  config = readConfig({
    DATABASE_URL: 'pglite:memory',
    LINGORA_ADMIN_TOKEN: ADMIN,
    LINGORA_CODES_KEY: randomBytes(32).toString('base64'),
    LINGORA_BEP20_ADDRESS: ADDRESS,
    BSC_MIN_CONFIRMATIONS: '5',
  });
  chain = fakeChain();
});

describe('order creation', () => {
  test('uses the server price table and ignores client-supplied amounts', async () => {
    const { status, body } = await call('order-create', {
      ...customer,
      amount: '1',
      currency: 'EUR',
    });
    assert.equal(status, 201);
    assert.match(body.id, /^LG-[2-9A-Z]{10}$/u);
    assert.equal(body.amount, '15.00');
    assert.equal(body.currency, 'USD');
    assert.match(body.usdtAmount, /^15\.0\d{3}$/u);
    assert.equal(body.payment.bep20Address, ADDRESS);
    const arabic = await call('order-create', { ...customer, track: 'ar' });
    assert.equal(arabic.body.currency, 'SAR');
    assert.match(arabic.body.usdtAmount, /^13\.(3[4-9]|4[0-3])\d{2}$/u);
  });

  test('rejects invalid details and plans without an approved price', async () => {
    const invalid = await call('order-create', {
      ...customer,
      email: 'nope',
      whatsapp: 'abc',
    });
    assert.equal(invalid.status, 400);
    assert.deepEqual(invalid.body.fields.sort(), ['email', 'whatsapp']);
    const family = await call('order-create', { ...customer, plan: 'family' });
    assert.equal(family.status, 400);
  });

  test('gives every pending order a distinct on-chain amount', () => {
    assert.equal(uniqueUsdtAmount('15.00', 7), '15.0007');
    assert.equal(uniqueUsdtAmount('13.34', 999), '13.4399');
  });
});

describe('tracking', () => {
  test('requires the matching email and never reveals other orders', async () => {
    const order = (await call('order-create', customer)).body;
    const ok = await call('order-lookup', {
      orderId: order.id.toLowerCase(),
      email: 'sara@example.com',
    });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.status, 'awaiting_payment');
    assert.equal(ok.body.code, null);
    const wrong = await call('order-lookup', {
      orderId: order.id,
      email: 'other@example.com',
    });
    assert.equal(wrong.status, 404);
    assert.equal(wrong.body.error, 'order_not_found');
  });
});

describe('automatic BEP20 verification', () => {
  test('confirms an exact USDT transfer, assigns a code and shows it only to the owner', async () => {
    await call(
      'admin-codes',
      { codes: ['https://example.invalid/redeem/AAA'] },
      { token: ADMIN },
    );
    const order = (await call('order-create', customer)).body;
    chain.pay(txHash(1), order.usdtAmount);
    const verified = await call('order-verify', {
      orderId: order.id,
      email: customer.email,
      txHash: txHash(1),
    });
    assert.equal(verified.status, 200);
    assert.equal(verified.body.status, 'fulfilled');
    assert.equal(verified.body.code, 'https://example.invalid/redeem/AAA');
    const stored = await db.query('SELECT ciphertext FROM lingora_codes');
    assert.doesNotMatch(stored.rows[0].ciphertext, /redeem/u);
  });

  test('rejects wrong amount, wrong token, failed tx, few confirmations and reused hashes', async () => {
    await call(
      'admin-codes',
      { codes: ['CODE-1', 'CODE-2'] },
      { token: ADMIN },
    );
    const order = (await call('order-create', customer)).body;
    const verify = (hash) =>
      call('order-verify', {
        orderId: order.id,
        email: customer.email,
        txHash: hash,
      });

    chain.pay(txHash(2), '15.0000');
    if (order.usdtAmount !== '15.0000')
      assert.equal((await verify(txHash(2))).body.error, 'payment_no_match');
    chain.pay(txHash(3), order.usdtAmount, { token: '0x' + '9'.repeat(40) });
    assert.equal((await verify(txHash(3))).body.error, 'payment_no_match');
    chain.pay(txHash(4), order.usdtAmount, { status: '0x0' });
    assert.equal((await verify(txHash(4))).body.error, 'payment_failed');
    chain.pay(txHash(5), order.usdtAmount, { block: 999 });
    const early = await verify(txHash(5));
    assert.equal(early.body.error, 'payment_confirmations');
    assert.equal(early.body.confirmations, 2);
    assert.equal((await verify(txHash(6))).body.error, 'payment_not_found');

    chain.pay(txHash(7), order.usdtAmount);
    assert.equal((await verify(txHash(7))).body.status, 'fulfilled');
    const second = (await call('order-create', customer)).body;
    const reused = await call('order-verify', {
      orderId: second.id,
      email: customer.email,
      txHash: txHash(7),
    });
    assert.equal(reused.body.error, 'tx_already_used');
  });

  test('stays disabled until a complete receiving address is configured', async () => {
    config = {
      ...config,
      bep20Address: readConfig({ LINGORA_BEP20_ADDRESS: '0x1234' })
        .bep20Address,
    };
    assert.equal(config.bep20Address, null);
    const order = (await call('order-create', customer)).body;
    const result = await call('order-verify', {
      orderId: order.id,
      email: customer.email,
      txHash: txHash(1),
    });
    assert.equal(result.status, 503);
    assert.equal(result.body.error, 'crypto_unavailable');
  });
});

describe('stock and fulfilment', () => {
  test('keeps paid orders visible without stock, then fulfils them on restock', async () => {
    const order = (await call('order-create', customer)).body;
    await call('order-report', {
      orderId: order.id,
      email: customer.email,
      method: 'Kuraimi',
      reference: 'TRX-55',
    });
    const confirmed = await call(
      'admin-confirm',
      { orderId: order.id },
      { token: ADMIN },
    );
    assert.equal(confirmed.body.status, 'paid');
    const restock = await call(
      'admin-codes',
      { codes: ['CODE-A', 'CODE-A', 'CODE-B'] },
      { token: ADMIN },
    );
    assert.deepEqual(
      {
        added: restock.body.added,
        fulfilled: restock.body.fulfilled,
        available: restock.body.available,
      },
      { added: 2, fulfilled: 1, available: 1 },
    );
    const tracked = await call('order-lookup', {
      orderId: order.id,
      email: customer.email,
    });
    assert.equal(tracked.body.status, 'fulfilled');
    assert.equal(tracked.body.code, 'CODE-A');
  });

  test('never assigns one code twice under concurrent payments', async () => {
    await call(
      'admin-codes',
      { codes: ['CODE-C1', 'CODE-C2', 'CODE-C3'] },
      { token: ADMIN },
    );
    const orders = [];
    for (let index = 0; index < 8; index += 1)
      orders.push((await call('order-create', customer)).body);
    const results = await Promise.all(
      orders.map((order) =>
        call('admin-confirm', { orderId: order.id }, { token: ADMIN }),
      ),
    );
    assert.equal(
      results.filter((result) => result.body.status === 'fulfilled').length,
      3,
    );
    assert.equal(
      results.filter((result) => result.body.status === 'paid').length,
      5,
    );
    const assigned = await db.query(
      "SELECT count(DISTINCT order_id)::int AS n FROM lingora_codes WHERE status = 'assigned'",
    );
    assert.equal(assigned.rows[0].n, 3);
  });

  test('confirming an already fulfilled order is idempotent', async () => {
    await call(
      'admin-codes',
      { codes: ['ONLY-1', 'ONLY-2'] },
      { token: ADMIN },
    );
    const order = (await call('order-create', customer)).body;
    await call('admin-confirm', { orderId: order.id }, { token: ADMIN });
    await call('admin-confirm', { orderId: order.id }, { token: ADMIN });
    const stock = await call('admin-codes', null, {
      method: 'GET',
      token: ADMIN,
    });
    assert.equal(stock.body.available, 1);
  });
});

describe('alternative payment requests and admin access', () => {
  test('stores a request for the owner to follow up', async () => {
    const created = await call('payment-request', {
      track: 'ar',
      name: 'علي',
      email: 'ali@example.com',
      whatsapp: '+967774000000',
      preferredMethod: 'Western Union',
      note: 'لا أملك حساب Binance',
    });
    assert.equal(created.status, 201);
    const listed = await call('admin-requests', null, {
      method: 'GET',
      token: ADMIN,
    });
    assert.equal(listed.body.requests[0].preferred_method, 'Western Union');
    const updated = await call(
      'admin-requests',
      { id: created.body.id, status: 'contacted' },
      { token: ADMIN },
    );
    assert.equal(updated.body.status, 'contacted');
  });

  test('rejects missing or wrong admin tokens and disables weak ones', async () => {
    assert.equal(
      (await call('admin-orders', null, { method: 'GET' })).status,
      401,
    );
    assert.equal(
      (await call('admin-orders', null, { method: 'GET', token: 'wrong' }))
        .status,
      401,
    );
    config = { ...config, adminToken: 'short' };
    assert.equal(
      (await call('admin-orders', null, { method: 'GET', token: 'short' }))
        .status,
      503,
    );
  });
});

test('code encryption round-trips and rejects a wrong key', () => {
  const key = randomBytes(32).toString('base64');
  const payload = encryptCode('SECRET-CODE', key);
  assert.equal(decryptCode(payload, key), 'SECRET-CODE');
  assert.throws(() => decryptCode(payload, randomBytes(32).toString('base64')));
});
