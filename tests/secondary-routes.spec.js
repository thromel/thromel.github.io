const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const ROUTES = [
  '/about',
  '/education',
  '/experience',
  '/achievements',
  '/news',
  '/learning',
  '/blog/',
  '/cv/',
  '/404.html',
  '/offline/',
];

test.describe('secondary route convergence', () => {
  test('secondary routes keep the shared research-core shell and no horizontal overflow', async ({ page }) => {
    for (const path of ROUTES) {
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
        const navigation = page.locator('#site-navigation');
        await expect(navigation).toHaveCount(1);
        await expect(navigation.locator(':scope > a')).toHaveCount(4);
        await expect(navigation.locator('[data-more-navigation] a')).toHaveCount(7);
        await expect(page.locator('main h1')).toBeVisible();
        const dimensions = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(dimensions.scrollWidth, `${path} at ${width}px`).toBeLessThanOrEqual(dimensions.clientWidth + 1);
      }
    }
  });

  test('CV is a focused download surface rather than an embedded document viewer', async ({ page }) => {
    await page.goto(`${BASE_URL}/cv/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /download cv/i })).toHaveCount(1);
  });

  test('ML hosting research URL remains a readable no-JavaScript artifact page', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/research/ml-remote-code-execution/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main h1')).toContainText('Remote Code Execution');
    await expect(page.locator('main')).toContainText('arXiv');
    await context.close();
  });
});
