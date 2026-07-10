const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';

async function visitHome(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
}

test.describe('research-first shell contract', () => {
  test('home has exactly four research-first blocks', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitHome(page);

    await expect(page.locator('[data-home-block]')).toHaveCount(4);
  });

  test('desktop navigation is limited to the research core', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitHome(page);

    const labels = await page.locator('#site-navigation a').allTextContents();
    expect(labels.map((label) => label.replace(/\s+/g, ' ').trim())).toEqual([
      'Research',
      'Publications',
      'Projects',
      'CV',
    ]);
  });

  test('mobile menu control is a 44px target', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await visitHome(page);

    const menuToggle = page.locator('#site-menu-toggle');
    await expect(menuToggle).toBeVisible();
    const bounds = await menuToggle.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
  });

  test('theme follows the system until a stored preference overrides it', async ({ page }) => {
    const html = page.locator('html');

    for (const systemTheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: systemTheme });
      await visitHome(page);
      await expect(html).toHaveAttribute('data-theme', systemTheme);
      await page.evaluate(() => localStorage.clear());
    }

    await page.emulateMedia({ colorScheme: 'light' });
    await visitHome(page);
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('home content remains visible when JavaScript is unavailable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    await visitHome(page);

    const blocks = page.locator('[data-home-block]');
    await expect(blocks).toHaveCount(4);
    const hiddenBlocks = await blocks.evaluateAll((elements) => elements.filter((element) => {
      const style = getComputedStyle(element);
      return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
    }).length);
    expect(hiddenBlocks).toBe(0);

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
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await visitHome(page);
      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth, `${width}px viewport`).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    }
  });

  test('current status identifies UIUC rather than IQVIA', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitHome(page);

    const status = page.locator('[data-current-status]');
    await expect(status).toContainText('UIUC');
    await expect(status).not.toContainText('IQVIA');
  });
});
