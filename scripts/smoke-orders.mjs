// End-to-end order flow against the static preview + API with an in-memory Postgres and a fake BSC node.
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, expect } from '@playwright/test';
import { USDT_BSC } from '../src/server/bsc.mjs';
import { usdtToWei } from '../src/server/prices.mjs';

const port = 4318;
const rpcPort = 4319;
const origin = `http://127.0.0.1:${port}`;
const address = '0x2222222222222222222222222222222222222222';
const adminToken = randomBytes(24).toString('hex');
const TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const receipts = new Map();

const rpc = createServer(async (request, response) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const { method, params } = JSON.parse(Buffer.concat(chunks).toString());
  const result =
    method === 'eth_getTransactionReceipt'
      ? (receipts.get(params[0]) ?? null)
      : method === 'eth_blockNumber'
        ? '0x100'
        : { timestamp: `0x${Math.floor(Date.now() / 1000).toString(16)}` };
  response.setHeader('content-type', 'application/json');
  response.end(JSON.stringify({ jsonrpc: '2.0', id: 1, result }));
});
await new Promise((resolve) => rpc.listen(rpcPort, '127.0.0.1', resolve));

const server = spawn(process.execPath, ['scripts/static-server.mjs'], {
  env: {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: String(port),
    DATABASE_URL: 'pglite:memory',
    LINGORA_ADMIN_TOKEN: adminToken,
    LINGORA_CODES_KEY: randomBytes(32).toString('base64'),
    LINGORA_BEP20_ADDRESS: address,
    BSC_RPC_URL: `http://127.0.0.1:${rpcPort}`,
    BSC_MIN_CONFIRMATIONS: '3',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
server.stdout.on('data', (chunk) => (serverOutput += chunk.toString()));
server.stderr.on('data', (chunk) => (serverOutput += chunk.toString()));
let browser;

try {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null)
      throw new Error(`Preview server exited:\n${serverOutput}`);
    try {
      if ((await fetch(origin)).ok) break;
    } catch {}
    await delay(250);
  }

  const admin = (path, body) =>
    fetch(`${origin}/api/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        authorization: `Bearer ${adminToken}`,
        'content-type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    }).then((response) => response.json());
  await admin('admin-codes', {
    codes: ['https://example.invalid/redeem/SMOKE-1'],
  });

  browser = await chromium.launch(
    process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {},
  );
  const context = await browser.newContext({
    viewport: { width: 375, height: 800 },
  });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin,
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  // 1. Subscription steps lead to the order page.
  await page.goto(`${origin}/subscription/`);
  await page.getByRole('link', { name: 'ابدأ الطلب' }).first().click();
  await expect(page).toHaveURL(`${origin}/order/`);

  // 2. Details are validated on submit, then the order is created.
  await page.getByRole('button', { name: 'اختر هذا الاشتراك' }).click();
  await page.getByRole('button', { name: 'متابعة إلى الدفع' }).click();
  await expect(page.getByText('اكتب بريدًا إلكترونيًا صحيحًا.')).toBeVisible();
  await page.getByLabel('الاسم').fill('سارة');
  await page.getByLabel('البريد الإلكتروني').fill('sara@example.com');
  await page.getByLabel('رقم واتساب').fill('+966550000000');
  await page.getByRole('button', { name: 'متابعة إلى الدفع' }).click();
  await expect(page.getByText('تم إنشاء طلبك')).toBeVisible();
  const orderId = (
    await page.locator('.order-number bdi').textContent()
  )?.trim();
  if (!/^LG-[2-9A-Z]{10}$/u.test(orderId ?? ''))
    throw new Error(`Unexpected order id ${orderId}`);
  await page
    .locator('.order-number')
    .getByRole('button', { name: 'نسخ' })
    .click();
  if ((await page.evaluate(() => navigator.clipboard.readText())) !== orderId)
    throw new Error('Copying the order number failed.');

  // 3. Pay the exact amount on the fake chain and verify automatically.
  const amount = (
    await page.locator('.copy-row .copy-value').first().textContent()
  )
    .replace('USDT', '')
    .trim();
  const txHash = `0x${'ab'.repeat(32)}`;
  receipts.set(txHash, {
    status: '0x1',
    blockNumber: '0xf0',
    logs: [
      {
        address: USDT_BSC,
        topics: [
          TRANSFER_TOPIC,
          `0x${'3'.repeat(64)}`,
          `0x${address.slice(2).padStart(64, '0')}`,
        ],
        data: `0x${usdtToWei(amount).toString(16)}`,
      },
    ],
  });
  await page.getByLabel('رقم العملية (TxID / Transaction hash)').fill(txHash);
  await page.getByRole('button', { name: 'تحقق من الدفع' }).click();

  // 4. Redirected to tracking with number and email filled in, code ready to copy.
  await expect(page).toHaveURL(new RegExp(`/track/#order=${orderId}`));
  await expect(page.getByLabel('رقم الطلب')).toHaveValue(orderId);
  await expect(page.getByLabel('البريد الإلكتروني')).toHaveValue(
    'sara@example.com',
  );
  await expect(
    page.getByRole('heading', { name: 'مكتمل — الكود جاهز' }),
  ).toBeVisible();
  await expect(page.locator('.code-value')).toHaveText(
    'https://example.invalid/redeem/SMOKE-1',
  );
  await page.locator('.code-box').getByRole('button', { name: 'نسخ' }).click();
  if (
    (await page.evaluate(() => navigator.clipboard.readText())) !==
    'https://example.invalid/redeem/SMOKE-1'
  )
    throw new Error('Copying the code failed.');

  // 5. Manual transfer → review → owner confirms → tracking shows the code after restock.
  await page.goto(`${origin}/en/order/`);
  await page.getByRole('button', { name: 'Choose this plan' }).click();
  await page.getByLabel('Name').fill('Omar');
  await page.getByLabel('Email').fill('omar@example.com');
  await page.getByLabel('WhatsApp number').fill('+967774000000');
  await page.getByRole('button', { name: 'Continue to payment' }).click();
  const secondId = (
    await page.locator('.order-number bdi').textContent()
  )?.trim();
  await page.getByLabel('Method used').selectOption({ index: 1 });
  await page.getByLabel('Transfer number or reference').fill('KR-778899');
  await page.getByRole('button', { name: 'Send transfer details' }).click();
  await expect(
    page.getByRole('heading', { name: 'Payment under review' }),
  ).toBeVisible();
  const confirmed = await admin('admin-confirm', { orderId: secondId });
  if (confirmed.status !== 'paid')
    throw new Error(`Expected paid without stock, got ${confirmed.status}`);
  const restock = await admin('admin-codes', { codes: ['SMOKE-CODE-2'] });
  if (restock.fulfilled !== 1)
    throw new Error('Restock did not fulfil the waiting order.');
  await page.reload();
  await expect(page.locator('.code-value')).toHaveText('SMOKE-CODE-2');

  // 6. Alternative payment method request reaches the owner.
  await page.goto(`${origin}/order/`);
  await page.getByRole('button', { name: 'اختر هذا الاشتراك' }).click();
  await page.getByLabel('الاسم').fill('علي');
  await page.getByLabel('البريد الإلكتروني').fill('ali@example.com');
  await page.getByLabel('رقم واتساب').fill('+967770000000');
  await page.getByRole('button', { name: 'متابعة إلى الدفع' }).click();
  await page
    .locator('.payment-method-panel.is-quiet')
    .getByRole('button', { name: 'أرسل الطلب' })
    .click();
  await page.getByLabel('طريقة الدفع التي تناسبك').fill('Western Union');
  await page.getByRole('button', { name: 'أرسل الطلب' }).click();
  await expect(page.getByText('وصل طلبك. ستتواصل معك الإدارة')).toBeVisible();
  const requests = await admin('admin-requests');
  if (requests.requests[0]?.preferred_method !== 'Western Union')
    throw new Error('Payment-method request was not stored.');

  // 7. Wrong email never reveals an order; dashboard requires the token.
  await page.goto(`${origin}/en/track/`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${origin}/en/track/`);
  await page.getByLabel('Order number').fill(orderId);
  await page.getByLabel('Email').fill('intruder@example.com');
  await page.getByRole('button', { name: 'Show order status' }).click();
  await expect(
    page.getByText('No order matches this number and email.'),
  ).toBeVisible();
  await page.goto(`${origin}/dashboard/`);
  await page.getByLabel('رمز الإدارة').fill(adminToken);
  await page.getByRole('button', { name: 'دخول لوحة الطلبات' }).click();
  await expect(page.getByText(orderId)).toBeVisible();

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  if (overflow) throw new Error('Dashboard overflows horizontally at 375px.');
  if (pageErrors.length)
    throw new Error(`Browser errors: ${pageErrors.join('; ')}`);
  console.log(
    'Order flow smoke passed: steps → details → automatic BEP20 verification → tracking with auto-filled order and copyable code; manual review, restock, payment-method requests and dashboard access work.',
  );
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  rpc.close();
}
