const { test, expect } = require('@playwright/test');

test('home navbar removes the TR marker and keeps nav links left-aligned', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('http://127.0.0.1:4000', { waitUntil: 'networkidle' });

  const siteTitle = page.locator('.site-title');
  const siteNav = page.locator('.site-nav');
  const navLinks = page.locator('.nav-links');

  const siteTitleCount = await siteTitle.count();
  expect(siteTitleCount).toBeLessThanOrEqual(1);

  if (siteTitleCount === 1) {
    await expect(siteTitle).not.toContainText('TR');
  }

  const [navBox, linksBox] = await Promise.all([
    siteNav.boundingBox(),
    navLinks.boundingBox(),
  ]);

  expect(navBox).not.toBeNull();
  expect(linksBox).not.toBeNull();

  const leftInset = linksBox.x - navBox.x;
  expect(
    leftInset,
    `Expected desktop nav links to start close to the left edge, but they were inset by ${leftInset}px.`,
  ).toBeLessThan(120);
});
