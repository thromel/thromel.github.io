const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const PAGE_CASES = ['/', '/about', '/learning', '/contributions', '/research'];

async function getFontSize(locator) {
  return locator.evaluate((element) => parseFloat(window.getComputedStyle(element).fontSize));
}

async function expectNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth, `${label} should not overflow horizontally.`).toBeLessThanOrEqual(dimensions.width + 1);
}

test.describe('academic readability hierarchy', () => {
  for (const path of PAGE_CASES) {
    test(`${path} uses readable academic body copy on desktop`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await page.goto(BASE_URL + path, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('.academic-page')).toHaveCount(1);
      await expect(page.locator('.academic-section').first()).toBeVisible();
      await expect(getFontSize(page.locator('p').first())).resolves.toBeGreaterThanOrEqual(14);
      await expectNoHorizontalOverflow(page, path);
    });
  }

  test('homepage preserves section hierarchy on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.academic-name')).toBeVisible();
    await expect(page.locator('#homepage-research-publications .academic-entry--selected h3').first()).toBeVisible();
    await expect(getFontSize(page.locator('#homepage-research-publications .academic-entry--selected p').first())).resolves.toBeGreaterThanOrEqual(14);
    await expectNoHorizontalOverflow(page, 'homepage mobile');
  });

  test('contributions metadata remains readable after async render', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.route('https://api.github.com/search/issues*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_count: 1,
          items: [{
            html_url: 'https://github.com/example/repo/pull/1',
            title: 'Improve academic theme',
            state: 'closed',
            pull_request: { merged_at: '2026-04-01T00:00:00Z' },
            repository_url: 'https://api.github.com/repos/example/repo',
            created_at: '2026-03-28T00:00:00Z',
            updated_at: '2026-04-01T00:00:00Z',
            labels: [],
            number: 1,
            user: { login: 'thromel' },
          }],
        }),
      });
    });
    await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.contribution-item').first()).toBeVisible();
    await expect(getFontSize(page.locator('.contribution-meta').first())).resolves.toBeGreaterThanOrEqual(14);
  });
});
