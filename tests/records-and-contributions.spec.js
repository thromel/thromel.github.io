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
    await expect(page.locator('[data-publication-group="review"]')).toHaveCount(1);
    await expect(page.locator('[data-publication-group="other"]')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Submitted and under review' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Theses and public manuscripts' })).toBeVisible();
    const records = page.locator('[data-publication-record]');
    expect(await records.count()).toBeGreaterThanOrEqual(3);
    await expect(records.first().locator('[data-publication-citation]')).toBeVisible();
    await expect(records.first().locator('h3')).toBeVisible();
    await expect(records.first().locator('.publication-record__status')).toBeVisible();
    for (const record of await records.all()) {
      await expect(record.locator('time[datetime]').first()).toBeVisible();
    }
    const covers = page.locator('[data-publication-cover]');
    await expect(covers).toHaveCount(2);
    for (const cover of await covers.all()) {
      await expect(cover).toHaveAttribute('alt', /\S+/);
      await expect(cover).toHaveAttribute('width', /^\d+$/);
      await expect(cover).toHaveAttribute('height', /^\d+$/);
      await expect(cover).toHaveAttribute('loading', 'lazy');
      expect(await cover.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    }
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

    for (const record of await records.all()) {
      await expect(record.locator('.project-record__problem strong')).toHaveText('Scope');
      await expect(record.locator('.project-record__problem span')).not.toHaveText('');
      const evidenceLabels = await record.locator('.project-record__evidence dt').allTextContents();
      expect(evidenceLabels).toEqual(expect.arrayContaining(['Role', 'Outcome', 'Status', 'Documented']));
      await expect(record.locator('.project-record__evidence time[datetime]')).toHaveCount(1);
      await expect(record.locator('.project-record__methods strong')).toHaveText('Methods');
      await expect(record.getByRole('link', { name: 'Open evidence record' })).toHaveCount(1);
      const repositoryEvidence = record.locator('.record-links a', { hasText: /^Repository$/ });
      const repositoryDisclosure = record.locator('.project-record__evidence dt', { hasText: 'Repository' });
      expect((await repositoryEvidence.count()) + (await repositoryDisclosure.count())).toBe(1);
    }

    await expect(page.locator('.record-review-note time[datetime="2026-08-02"]')).toHaveText('August 2, 2026');

    const visuals = page.locator('[data-project-visual]');
    expect(await visuals.count()).toBeGreaterThanOrEqual(8);
    for (const visual of await visuals.all()) {
      await expect(visual).toHaveAttribute('alt', /\S+/);
      await expect(visual).toHaveAttribute('width', /^\d+$/);
      await expect(visual).toHaveAttribute('height', /^\d+$/);
      await expect(visual).toHaveAttribute('loading', 'lazy');
      await visual.scrollIntoViewIfNeeded();
      const src = await visual.getAttribute('src');
      await expect.poll(
        () => visual.evaluate((image) => image.complete && image.naturalWidth > 0),
        { message: `project visual ${src} should decode`, timeout: 10000 },
      ).toBe(true);
    }
  });

  test('research dossier pairs evidence anchors with relevant local visuals', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE_URL}/research`, { waitUntil: 'domcontentloaded' });

    const visuals = page.locator('[data-research-visual]');
    await expect(visuals).toHaveCount(3);
    for (const visual of await visuals.all()) {
      await expect(visual).toHaveAttribute('alt', /\S+/);
      await expect(visual).toHaveAttribute('width', /^\d+$/);
      await expect(visual).toHaveAttribute('height', /^\d+$/);
      await expect(visual).toHaveAttribute('loading', 'lazy');
      expect(await visual.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    }
    const institutionalMark = page.locator('.evidence-record__visual--mark img');
    await expect(institutionalMark).toHaveCount(1);
    expect((await institutionalMark.boundingBox()).width).toBeLessThanOrEqual(48.5);
    for (const anchor of await page.locator('[data-research-anchor]').all()) {
      expect(await anchor.locator('.record-links a').count()).toBeLessThanOrEqual(2);
    }
  });

  test('curated contributions use direct PR evidence and no full client feed', async ({ page }) => {
    await page.route('https://api.github.com/search/issues*', async (route) => {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ total_count: 47, incomplete_results: false, items: [] }) });
    });
    await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-contributions-curated]')).toHaveCount(1);
    await expect(page.locator('a[data-contribution-proof][href*="/pull/"]')).toHaveCount(6);
    for (const link of await page.locator('a[data-contribution-proof]').all()) {
      await expect(link).toHaveAttribute('aria-label', /opens in a new tab/i);
    }
    await expect(page.locator('[data-contribution-feed]')).toHaveCount(0);
    await expect(page.locator('script[src*="contributions.js"]')).toHaveCount(0);
  });

  test('contribution count is neutral and not busy without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });

    const count = page.locator('[data-contribution-count]');
    await expect(count).toHaveAttribute('data-state', 'unavailable');
    await expect(count).toHaveAttribute('aria-busy', 'false');
    await expect(count.locator('[data-no-js-fallback]')).toBeVisible();
    await expect(count).not.toContainText('Checking the current');
    await context.close();
  });

  test('experience uses a concise, contextual working set', async ({ page }) => {
    await page.goto(`${BASE_URL}/experience`, { waitUntil: 'domcontentloaded' });
    const categories = page.locator('.skills-ledger__list > p');
    await expect(categories).toHaveCount(4);
    const skills = await categories.locator('span').allTextContents();
    expect(skills.flatMap((line) => line.split('·')).map((item) => item.trim()).filter(Boolean)).toHaveLength(15);
    await expect(categories.nth(2).locator('span')).toHaveText('SQL Server · MongoDB · AWS S3');
    await expect(page.getByRole('heading', { name: 'Tools used across the evidence above' })).toBeVisible();
    for (const image of await page.locator('.experience-record__mark img').all()) {
      await expect(image).toHaveAttribute('width', '48');
      await expect(image).toHaveAttribute('height', '48');
    }
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

    await page.getByRole('button', { name: 'Retry count' }).click();
    await expect(count).toContainText('48');
    expect(calls).toBe(2);
  });

  test('compact GitHub count classifies incomplete, empty, rate-limit, generic error, and timeout responses', async ({ page }) => {
    const cases = [
      { state: 'incomplete', response: { status: 200, body: { total_count: 7, incomplete_results: true, items: [] } } },
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
      if (testCase.state === 'incomplete') {
        await expect(page.locator('#contribution-count-value')).toHaveText('—');
        await expect(page.locator('#contribution-count-status')).toContainText('no exact count');
      }
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
