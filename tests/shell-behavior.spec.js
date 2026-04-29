const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const PAGE_CASES = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Learning', path: '/learning' },
  { name: 'Contributions', path: '/contributions' },
];

async function gotoShellPage(page, pageCase) {
  return page.goto(BASE_URL + pageCase.path, { waitUntil: 'domcontentloaded' });
}

async function expectNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth, `${label} should not overflow horizontally.`).toBeLessThanOrEqual(dimensions.width + 1);
}

test.describe('academic shell landmarks', () => {
  for (const pageCase of PAGE_CASES) {
    test(`${pageCase.name} exposes one minimal academic shell`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoShellPage(page, pageCase);

      await expect(page.locator('.skip-link[href="#main-content"]')).toHaveCount(1);
      await expect(page.locator('.skip-link[href="#site-navigation"]')).toHaveCount(1);
      await expect(page.locator('#main-content.academic-page')).toHaveCount(1);
      await expect(page.locator('#site-navigation.academic-nav')).toHaveCount(1);
      await expect(page.locator('#themeToggle.theme-toggle')).toHaveCount(1);
      await expect(page.locator('.mobile-nav-drawer')).toHaveCount(0);
      await expect(page.locator('.back-to-top')).toHaveCount(0);
    });

    test(`${pageCase.name} mobile shell wraps without drawer or overflow`, async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await gotoShellPage(page, pageCase);

      await expect(page.locator('#site-navigation.academic-nav')).toHaveCount(1);
      await expect(page.locator('.mobile-menu-toggle')).toHaveCount(0);
      await expectNoHorizontalOverflow(page, pageCase.name);
    });
  }
});


test('academic shell dark mode toggle persists explicit choice', async ({ page }) => {
  await page.setViewportSize(DESKTOP_VIEWPORT);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('theme'));
  await page.reload({ waitUntil: 'domcontentloaded' });

  const html = page.locator('html');
  const toggle = page.locator('#themeToggle');
  const initialTheme = await html.getAttribute('data-theme');
  expect(['dark', 'light']).toContain(initialTheme);

  await toggle.click();
  await expect.poll(async () => html.getAttribute('data-theme')).not.toBe(initialTheme);
  const toggledTheme = await html.getAttribute('data-theme');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(html).toHaveAttribute('data-theme', toggledTheme);
});
