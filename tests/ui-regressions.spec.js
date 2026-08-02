const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';

const REFLOW_ROUTES = [
  '/',
  '/research/',
  '/experience/',
  '/education/',
  '/achievements/',
  '/news/',
  '/blog/2021/12/27/getting-started-with-ns3/',
  '/showcase/projects/ray-tracing/',
  '/showcase/projects/tcp-vegas-plus/',
];

test.describe('overhaul regression coverage', () => {
  test('homepage identity and evidence media are present, responsive, and decodable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.site-brand__mark')).toHaveText('TR');
    await expect(page.locator('[data-home-affiliation-logo]')).toBeVisible();
    await expect(page.locator('[data-home-work-logo]')).toHaveCount(2);
    await expect(page.locator('[data-home-record-visual]')).toHaveCount(4);

    const portrait = page.locator('[data-home-portrait]');
    await expect(portrait).toHaveAttribute('srcset', /romel-320\.webp 320w/);
    expect(await portrait.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);

    for (const image of await page.locator('[data-home-image], [data-home-work-logo]').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0), { timeout: 10000 }).toBe(true);
    }

    const responsiveStudyImage = page.locator('[data-home-image][src*="ml-rce"]');
    await expect(responsiveStudyImage).toHaveAttribute('srcset', /ml-rce-320\.webp 320w.*ml-rce-640\.webp 640w/);
  });

  test('text-spacing overrides and narrow viewports do not create page-level overflow', async ({ page }) => {
    for (const width of [320, 390, 640]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of REFLOW_ROUTES) {
        const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
        expect(response.ok(), `${route} should resolve`).toBe(true);
        await page.addStyleTag({ content: `
          * { letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
          body { line-height: 1.5 !important; }
          p { margin-bottom: 2em !important; }
        ` });
        const geometry = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(geometry.scrollWidth, `${route} at ${width}px with text spacing`).toBeLessThanOrEqual(geometry.clientWidth + 1);
      }
    }
  });

  test('long-form code is keyboard-scrollable and generated contents navigation is available', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of [
      '/blog/2023/01/27/clique-partition-problem-graph-theory/',
      '/showcase/projects/ctxhelm/',
    ]) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      const content = page.locator('[data-longform-content]');
      await expect(content).toBeVisible();
      const codeBlocks = content.locator('pre');
      expect(await codeBlocks.count(), `${route} should contain code blocks`).toBeGreaterThan(0);
      for (const block of await codeBlocks.all()) await expect(block).toHaveAttribute('tabindex', '0');

      const firstBlock = codeBlocks.first();
      await firstBlock.scrollIntoViewIfNeeded();
      await firstBlock.focus();
      await expect(firstBlock).toBeFocused();
      expect(await firstBlock.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');

      const toc = page.locator('[data-longform-toc]');
      await expect(toc).toBeVisible();
      await expect(toc.locator('[data-longform-toc-list] li')).not.toHaveCount(0);

      const results = await new AxeBuilder({ page }).analyze();
      const blocking = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
      expect(blocking, `${route}: ${blocking.map((violation) => violation.id).join(', ')}`).toEqual([]);
    }
  });

  test('lazy long-form images reserve their final geometry before decoding', async ({ page }) => {
    let releaseImage;
    let markRequestSeen;
    const imageGate = new Promise((resolve) => { releaseImage = resolve; });
    const requestSeen = new Promise((resolve) => { markRequestSeen = resolve; });

    await page.addInitScript(() => {
      window.__layoutShiftScore = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__layoutShiftScore += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.route('**/assets/images/projects/ctxhelm-system-architecture.svg', async (route) => {
      markRequestSeen();
      await imageGate;
      await route.continue();
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/showcase/projects/ctxhelm/`, { waitUntil: 'domcontentloaded' });
    const image = page.locator('#showcase-content img[src*="ctxhelm-system-architecture.svg"]');
    await image.evaluate((node) => node.scrollIntoView({ block: 'center' }));
    await requestSeen;

    const before = await image.boundingBox();
    expect(before).not.toBeNull();
    expect(before.width).toBeGreaterThan(300);
    expect(before.height).toBeGreaterThan(150);

    releaseImage();
    await expect.poll(() => image.evaluate((node) => node.complete && node.naturalWidth > 0), { timeout: 10000 }).toBe(true);
    const after = await image.boundingBox();
    expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => window.__layoutShiftScore)).toBeLessThanOrEqual(0.01);
  });
});
