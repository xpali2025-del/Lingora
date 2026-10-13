import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium, expect } from '@playwright/test';

const port = 4317;
const server = spawn(process.execPath, ['scripts/static-server.mjs'], {
  env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
server.stdout.on('data', (chunk) => (serverOutput += chunk.toString()));
server.stderr.on('data', (chunk) => (serverOutput += chunk.toString()));
const origin = `http://127.0.0.1:${port}`;
let browser;

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null)
      throw new Error(`Static server exited early:\n${serverOutput}`);
    try {
      const response = await fetch(origin);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await delay(250);
  }
  if (!ready)
    throw new Error(`Static server did not become ready:\n${serverOutput}`);
  const rootResponse = await fetch(origin);
  for (const path of ['/saudi-arabia/', '/en/usa/']) {
    const response = await fetch(`${origin}${path}`);
    if (response.status !== 404)
      throw new Error(
        `Research-only market route ${path} returned ${response.status}, expected 404.`,
      );
  }
  const screenshotResponse = await fetch(
    `${origin}/images/duolingo-super-features-ar.jpg`,
  );
  if (screenshotResponse.headers.get('content-type') !== 'image/jpeg')
    throw new Error(
      'The subscription screenshot is not served with image/jpeg content type.',
    );
  for (const [name, expected] of [
    ['x-content-type-options', 'nosniff'],
    ['referrer-policy', 'strict-origin-when-cross-origin'],
    [
      'strict-transport-security',
      'max-age=63072000; includeSubDomains; preload',
    ],
  ]) {
    if (rootResponse.headers.get(name) !== expected) {
      throw new Error(`Missing or incorrect ${name} header.`);
    }
  }
  const csp = rootResponse.headers.get('content-security-policy') ?? '';
  if (csp.includes("'unsafe-inline'") || csp.includes('unpkg.com')) {
    throw new Error(
      'Public content CSP is not strict or contains an admin-only origin.',
    );
  }
  const adminResponse = await fetch(`${origin}/admin/`);
  if (
    !(adminResponse.headers.get('content-security-policy') ?? '').includes(
      'https://unpkg.com',
    )
  ) {
    throw new Error(
      'The admin-only CSP does not allow the configured Decap CMS asset host.',
    );
  }

  browser = await chromium.launch();
  const page = await browser.newPage();
  const externalRequests = [];
  const scriptRequests = [];
  const pageErrors = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== origin) externalRequests.push(request.url());
    if (request.resourceType() === 'script') scriptRequests.push(request.url());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(origin);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Duolingo Super',
  );
  await page.getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(`${origin}/en/`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Duolingo Super',
  );
  await page.getByRole('link', { name: 'العربية' }).click();
  await expect(page).toHaveURL(`${origin}/`);

  if (externalRequests.length)
    throw new Error(
      `Unexpected third-party requests: ${externalRequests.join(', ')}`,
    );
  if (scriptRequests.length)
    throw new Error(
      `Static content requested scripts: ${scriptRequests.join(', ')}`,
    );
  if (pageErrors.length)
    throw new Error(`Browser page errors: ${pageErrors.join('; ')}`);
  console.log(
    'Static export smoke passed: AR/RTL and EN/LTR routes navigate without JavaScript or third-party requests.',
  );
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
