import { expect, test } from '@playwright/test';

test('Arabic root has Arabic language and RTL direction', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('English root has English language and LTR direction', async ({
  page,
}) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('Lingora logo and subscription image have descriptive SEO alt text', async ({
  page,
}) => {
  await page.goto('/');
  const logo = page.getByRole('img', {
    name: /شعار Lingora لمعلومات اشتراك Duolingo Super/,
  });
  await expect(logo).toBeVisible();
  await expect
    .poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBe(800);
  await expect(
    page.getByRole('img', {
      name: /لقطة شاشة من واجهة Duolingo Super بالعربية/,
    }),
  ).toHaveCount(0);

  await page.goto('/subscription/');
  const featureImage = page.getByRole('img', {
    name: /لقطة شاشة من واجهة Duolingo Super بالعربية/,
  });
  await expect(featureImage).toBeVisible();
  await expect(featureImage).toHaveAttribute(
    'src',
    '/images/duolingo-super-features-ar.jpg',
  );
  await expect
    .poll(() =>
      featureImage.evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBe(900);
});

test('every rendered image on content routes has a descriptive alt attribute', async ({
  page,
}) => {
  for (const route of [
    '/',
    '/subscription/',
    '/payment-methods/',
    '/en/payment-methods/',
  ]) {
    await page.goto(route);
    const altTexts = await page
      .locator('img')
      .evaluateAll((images) =>
        images.map((image) => image.getAttribute('alt')?.trim() ?? ''),
      );
    expect(altTexts.length, `${route} should render the logo`).toBeGreaterThan(
      0,
    );
    expect(
      altTexts.every((alt) => alt.length >= 20),
      `${route} has an empty or vague image alt`,
    ).toBe(true);
  }
});

test('payment methods page shows the owner-supplied Yemen methods and keeps markets separate', async ({
  page,
}) => {
  await page.goto('/payment-methods/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'طرق الدفع لدى Lingora',
  );
  await expect(page.getByText('*1310061*')).toBeVisible();
  await expect(page.getByText('3014666442')).toBeVisible();
  await expect(page.getByText('3026969963')).toBeVisible();
  await expect(page.getByText('3019283789')).toBeVisible();
  await expect(page.getByText('774786786')).toBeVisible();
  await expect(page.getByText('USDT · BEP20')).toBeVisible();
  await expect(
    page.getByText(/العنوان الذي وصل للمراجعة غير مكتمل/),
  ).toBeVisible();
  await page.goto('/en/payment-methods/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Lingora payment methods',
  );
});

test('market switcher links to reciprocal locale roots without redirecting', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute(
    'href',
    '/en/',
  );
  await page.goto('/en/');
  await expect(page.getByRole('link', { name: 'العربية' })).toHaveAttribute(
    'href',
    '/',
  );
});

test('owner-confirmed offer copy distinguishes Super options from Max', async ({
  page,
}) => {
  await page.goto('/subscription/');
  const arabicMain = page.locator('main');
  await expect(arabicMain).toContainText('Super الفردي أو العائلي');
  await expect(arabicMain).toContainText('الخيار العائلي لا يشمله الخصم');
  await expect(arabicMain).toContainText('لا تقدم Lingora Duolingo Max');

  await page.goto('/en/plans/');
  const englishMain = page.locator('main');
  await expect(englishMain).toContainText('individual and Family options');
  await expect(englishMain).toContainText('Family option is not discounted');
  await expect(englishMain).toContainText(
    'Lingora does not offer Duolingo Max',
  );
});

test('About pages present the mission and owner-confirmed contact details for indexing', async ({
  page,
}) => {
  await page.goto('/about/');
  const arabicMain = page.locator('main');
  await expect(arabicMain).toContainText('عن Lingora');
  await expect(arabicMain).toContainText('هدفنا');
  await expect(arabicMain).toContainText('رؤيتنا');
  await expect(arabicMain).toContainText('لماذا Lingora؟');
  await expect(arabicMain).toContainText('+966554751363');
  await expect(arabicMain).toContainText('info@lingora.com');
  await expect(arabicMain).toContainText('sales@lingora.com');
  await expect(
    page.getByRole('link', { name: 'info@lingora.com' }),
  ).toHaveAttribute('href', 'mailto:info@lingora.com');
  await expect(
    page.getByRole('link', { name: '+966554751363' }),
  ).toHaveAttribute('href', 'tel:+966554751363');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'index, follow',
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute('href', 'https://lingora.com/en/about/');

  await page.goto('/en/about/');
  const englishMain = page.locator('main');
  await expect(englishMain).toContainText('About Lingora');
  await expect(englishMain).toContainText('Our purpose');
  await expect(englishMain).toContainText('Our vision');
  await expect(englishMain).toContainText('Why Lingora?');
  await expect(englishMain).toContainText('+966554751363');
  await expect(englishMain).toContainText('info@lingora.com');
  await expect(englishMain).toContainText('sales@lingora.com');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'index, follow',
  );

  const sitemap = await page.request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain('https://lingora.com/about/');
  expect(sitemapText).toContain('https://lingora.com/en/about/');
  expect(sitemapText).not.toContain('/subscription/');
  const robots = await page.request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  const robotsText = await robots.text();
  expect(robotsText).toContain('Disallow: /api/');
  expect(robotsText).toContain('Disallow: /admin/');
  expect(robotsText).toContain('Sitemap: https://lingora.com/sitemap.xml');
});

test('payment methods navigation is available on both locale roots', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'طرق الدفع' })).toHaveAttribute(
    'href',
    '/payment-methods/',
  );
  await page.goto('/en/');
  await expect(
    page.getByRole('link', { name: 'Payment methods' }),
  ).toHaveAttribute('href', '/en/payment-methods/');
});

test('content pages make no third-party requests', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    const requestUrl = new URL(request.url());
    if (requestUrl.origin !== 'http://127.0.0.1:3000')
      externalRequests.push(request.url());
  });
  await page.goto('/');
  await page.goto('/en/');
  await page.goto('/payment-methods/');
  await page.goto('/en/payment-methods/');
  expect(externalRequests).toEqual([]);
});
