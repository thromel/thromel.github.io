const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const HOME_BLOCKS = ['agenda', 'evidence', 'systems', 'contact'];

async function visitHome(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
}

async function expectNoHorizontalOverflow(page, width) {
  await page.setViewportSize({ width, height: 900 });
  await visitHome(page);
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth, `${width}px viewport`).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

test.describe('research-first shell contract', () => {
  test('home is exactly four meaningful research-first blocks', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitHome(page);

    const blocks = page.locator('main > [data-home-block]');
    await expect(blocks).toHaveCount(4);
    await expect(blocks.evaluateAll((elements) => elements.map((element) => element.dataset.homeBlock))).resolves.toEqual(HOME_BLOCKS);
    await expect(page.locator('[data-home-block="agenda"] h1')).toContainText('Tanzim Hossain Romel');
    await expect(page.locator('[data-home-block="evidence"] [data-research-anchor]')).toHaveCount(3);
    await expect(page.locator('[data-home-block="evidence"]')).toContainText('SREGym');
    await expect(page.locator('[data-home-block="evidence"]')).toContainText('Remote Code Execution');
    await expect(page.locator('[data-home-block="evidence"]')).toContainText('SHIFT');
    await expect(page.locator('[data-home-block="systems"]')).toContainText('Supporting systems');
    await expect(page.locator('[data-home-block="contact"]')).toContainText('Collaborate');

    const controls = await page.locator('main a, main button').count();
    expect(controls).toBeLessThanOrEqual(30);
  });

  test('desktop navigation is visible and limited to the research core', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitHome(page);

    const nav = page.locator('#site-navigation');
    const labels = await nav.locator('a').allTextContents();
    expect(labels.map((label) => label.replace(/\s+/g, ' ').trim())).toEqual([
      'Research',
      'Publications',
      'Projects',
      'CV',
    ]);
    for (const label of labels) {
      await expect(nav.getByRole('link', { name: label.trim(), exact: true })).toBeVisible();
    }
  });

  test('mobile menu has an accessible 44px control and exposes the core routes', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await visitHome(page);

    const menuToggle = page.getByRole('button', { name: /menu/i });
    await expect(menuToggle).toHaveAttribute('id', 'site-menu-toggle');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    const bounds = await menuToggle.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);

    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    for (const route of ['Research', 'Publications', 'Projects', 'CV']) {
      await expect(page.locator('#site-navigation').getByRole('link', { name: route, exact: true })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('theme follows the first-paint system preference until storage overrides it', async ({ browser }) => {
    for (const systemTheme of ['light', 'dark']) {
      const context = await browser.newContext({ colorScheme: systemTheme });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__themeAssignments = [];
        const originalSetAttribute = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function (name, value) {
          if (name === 'data-theme' && this === document.documentElement) {
            window.__themeAssignments.push(value);
          }
          return originalSetAttribute.call(this, name, value);
        };
      });
      await visitHome(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', systemTheme);
      await expect.poll(() => page.evaluate(() => window.__themeAssignments[0])).toBe(systemTheme);
      await context.close();
    }

    const context = await browser.newContext({ colorScheme: 'light' });
    const page = await context.newPage();
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await visitHome(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await context.close();
  });

  test('home and mobile navigation remain useful without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 800 },
    });
    const page = await context.newPage();
    await visitHome(page);

    const blocks = page.locator('main > [data-home-block]');
    await expect(blocks).toHaveCount(4);
    await expect(page.locator('[data-home-block="agenda"] h1')).toBeVisible();
    await expect(page.locator('[data-home-block="evidence"] [data-research-anchor]').first()).toBeVisible();
    for (const route of ['Research', 'Publications', 'Projects', 'CV']) {
      await expect(page.locator('#site-navigation').getByRole('link', { name: route, exact: true })).toBeVisible();
    }
    await context.close();
  });

  test('skip link focuses the main landmark', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitHome(page);

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  test('home never overflows horizontally from 320px through 1440px', async ({ page }) => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await expectNoHorizontalOverflow(page, width);
    }
  });

  test('current status is inside its rendered ISO range', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitHome(page);

    const status = page.locator('[data-current-status]');
    const [asOf, starts, ends] = await Promise.all([
      status.getAttribute('data-as-of'),
      status.getAttribute('data-start-date'),
      status.getAttribute('data-end-date-exclusive'),
    ]);
    expect(asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(starts).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(ends).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(starts <= asOf && asOf < ends).toBe(true);

    if (asOf >= '2026-06-01' && asOf < '2026-09-01') {
      await expect(status).toContainText('UIUC');
      await expect(status).not.toContainText('IQVIA');
    }
  });
});
