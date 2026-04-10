const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
// Desktop viewport: 1280, 720
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
// Mobile viewport: 390, 844
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const PAGE_CASES = [
  { name: 'Home', path: '/', fallbackPath: '/' },
  { name: 'About', path: '/about', fallbackPath: '/about.html' },
  { name: 'Contributions', path: '/contributions', fallbackPath: '/contributions.html' }
];

async function gotoShellPage(page, pageCase) {
  const primaryResponse = await page.goto(BASE_URL + pageCase.path, { waitUntil: 'domcontentloaded' });

  if (pageCase.path === pageCase.fallbackPath) {
    return primaryResponse;
  }

  if (!primaryResponse || primaryResponse.status() === 404) {
    return page.goto(BASE_URL + pageCase.fallbackPath, { waitUntil: 'domcontentloaded' });
  }

  return primaryResponse;
}

async function clearStoredTheme(page) {
  await page.evaluate(() => {
    try {
      window.localStorage.removeItem('theme');
    } catch (_) {
      // Ignore private browsing/storage restrictions.
    }
  });
}

test.describe('canonical shell theme behavior', () => {
  for (const pageCase of PAGE_CASES) {
    test(`${pageCase.name} keeps exactly one theme toggle and persists explicit theme choice`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoShellPage(page, pageCase);
      await clearStoredTheme(page);
      await page.reload({ waitUntil: 'domcontentloaded' });

      const themeToggle = page.locator('#themeToggle');
      const nav = page.locator('#site-navigation');
      const html = page.locator('html');

      await expect(themeToggle).toHaveCount(1);
      await expect(nav).toHaveCount(1);

      const initialTheme = await html.getAttribute('data-theme');
      expect(['dark', 'light']).toContain(initialTheme);

      await themeToggle.click();

      await expect
        .poll(async () => html.getAttribute('data-theme'))
        .not.toBe(initialTheme);

      const toggledTheme = await html.getAttribute('data-theme');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(html).toHaveAttribute('data-theme', toggledTheme);
    });
  }
});

test.describe('canonical shell mobile navigation behavior', () => {
  for (const pageCase of PAGE_CASES) {
    test(`${pageCase.name} mobile drawer opens and closes through canonical shell controls`, async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await gotoShellPage(page, pageCase);

      const mobileMenuToggle = page.locator('#mobileMenuToggle');
      const mobileNavDrawer = page.locator('#mobileNavDrawer');
      const mobileNavOverlay = page.locator('#mobileNavOverlay');
      const mobileNavClose = page.locator('#mobileNavClose');

      await expect(mobileMenuToggle).toHaveCount(1);
      await expect(mobileNavDrawer).toHaveCount(1);
      await expect(mobileNavOverlay).toHaveCount(1);
      await expect(mobileNavClose).toHaveCount(1);

      await mobileMenuToggle.click();
      await expect(mobileNavDrawer).toHaveClass(/open/);
      await expect(mobileNavOverlay).toHaveClass(/open/);
      await expect(mobileMenuToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(mobileNavDrawer).toHaveAttribute('aria-hidden', 'false');

      await mobileNavOverlay.click();
      await expect(mobileNavDrawer).not.toHaveClass(/open/);
      await expect(mobileNavOverlay).not.toHaveClass(/open/);
      await expect(mobileMenuToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(mobileNavDrawer).toHaveAttribute('aria-hidden', 'true');

      await mobileMenuToggle.click();
      await expect(mobileNavDrawer).toHaveClass(/open/);
      await mobileNavClose.click();
      await expect(mobileNavDrawer).not.toHaveClass(/open/);
      await expect(mobileNavOverlay).not.toHaveClass(/open/);
    });
  }
});
