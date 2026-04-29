const { test, expect } = require('@playwright/test');
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';

test('academic navbar uses slash-separated links and no TR marker', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  const nav = page.locator('#site-navigation.academic-nav');
  await expect(nav).toHaveCount(1);
  await expect(nav).not.toContainText('TR');
  await expect(nav).toContainText('/');
  await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
});
