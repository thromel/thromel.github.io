const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';

async function expectNoHorizontalOverflow(page, path, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth, `${path} at ${width}px`).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test.describe('research records and contribution proof', () => {
  test('publications are citation-first research records', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE_URL}/publications`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-publication-archive]')).toHaveCount(1);
    const records = page.locator('[data-publication-record]');
    expect(await records.count()).toBeGreaterThanOrEqual(3);
    await expect(records.first().locator('[data-publication-citation]')).toBeVisible();
    await expect(records.first().locator('h2, h3')).toBeVisible();
    await expect(page.locator('[data-publication-archive] img')).toHaveCount(0);
  });

  test('project records render once and retain compact groups', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE_URL}/projects`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-project-archive]')).toHaveCount(1);
    const records = page.locator('[data-project-record]');
    expect(await records.count()).toBeGreaterThanOrEqual(4);
    const titles = await records.evaluateAll((elements) => elements.map((element) => element.dataset.projectTitle));
    expect(new Set(titles).size).toBe(titles.length);
    await expect(page.locator('[data-project-group]')).toHaveCount(2);
  });

  test('curated contributions use direct PR evidence and no full client feed', async ({ page }) => {
    await page.route('https://api.github.com/search/issues*', async (route) => {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ total_count: 47, incomplete_results: false, items: [] }) });
    });
    await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-contributions-curated]')).toHaveCount(1);
    await expect(page.locator('a[data-contribution-proof][href*="/pull/"]')).toHaveCount(6);
    await expect(page.locator('[data-contribution-feed]')).toHaveCount(0);
    await expect(page.locator('script[src*="contributions.js"]')).toHaveCount(0);
  });

  test('compact GitHub count makes one merged-PR request and renders success, empty, rate, error, timeout, and retry states', async ({ page }) => {
    let calls = 0;
    await page.route('https://api.github.com/search/issues*', async (route) => {
      calls += 1;
      const url = new URL(route.request().url());
      expect(url.searchParams.get('per_page')).toBe('1');
      expect(url.searchParams.get('q')).toContain('is:merged');
      if (calls === 1) {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ total_count: 47, incomplete_results: false, items: [] }) });
      } else {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ total_count: 48, incomplete_results: false, items: [] }) });
      }
    });
    await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });

    const count = page.locator('[data-contribution-count]');
    await expect(count).toHaveAttribute('data-state', 'success');
    await expect(count).toContainText('47');
    await expect(count.locator('[aria-live="polite"]')).toBeVisible();

    await page.getByRole('button', { name: /refresh count/i }).click();
    await expect(count).toContainText('48');
    expect(calls).toBe(2);
  });

  test('compact GitHub count classifies empty, rate-limit, generic error, and timeout responses', async ({ page }) => {
    const cases = [
      { state: 'empty', response: { status: 200, body: { total_count: 0, incomplete_results: false, items: [] } } },
      { state: 'rate-limit', response: { status: 403, body: { message: 'API rate limit exceeded' } } },
      { state: 'error', response: { status: 500, body: { message: 'server error' } } },
    ];

    for (const testCase of cases) {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      await page.route('https://api.github.com/search/issues*', async (route) => {
        await route.fulfill({ status: testCase.response.status, contentType: 'application/json', body: JSON.stringify(testCase.response.body) });
      });
      await page.goto(`${BASE_URL}/contributions?state=${testCase.state}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-contribution-count]')).toHaveAttribute('data-state', testCase.state);
    }

    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await page.route('https://api.github.com/search/issues*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 5500));
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ total_count: 1, items: [] }) }).catch(() => {});
    });
    await page.goto(`${BASE_URL}/contributions?state=timeout`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-contribution-count]')).toHaveAttribute('data-state', 'timeout', { timeout: 7000 });
  });

  test('core archive pages do not overflow from phone to desktop', async ({ page }) => {
    for (const path of ['/publications', '/projects', '/contributions']) {
      for (const width of [320, 390, 768, 1440]) {
        await expectNoHorizontalOverflow(page, path, width);
      }
    }
  });
});
