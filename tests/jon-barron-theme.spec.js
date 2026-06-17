const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const DESKTOP = { width: 1280, height: 720 };
const MOBILE = { width: 390, height: 844 };

async function expectNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth, `${label} should not overflow horizontally.`).toBeLessThanOrEqual(dimensions.width + 1);
}

test.describe('Modern academic portfolio theme', () => {
  test('homepage uses a wider research-lab document and minimal identity row on desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const shell = page.locator('.academic-page');
    await expect(shell).toHaveCount(1);
    const maxWidth = await shell.evaluate((node) => Number.parseFloat(getComputedStyle(node).maxWidth));
    expect(maxWidth).toBeGreaterThanOrEqual(1000);
    expect(maxWidth).toBeLessThanOrEqual(1120);

    await expect(page.locator('.academic-intro')).toHaveCount(1);
    await expect(page.locator('.academic-name')).toHaveText('Tanzim Hossain Romel');
    await expect(page.locator('.academic-portrait img')).toHaveCSS('border-radius', /6px|8px/);
    await expect(page.locator('.academic-proof-strip article')).toHaveCount(4);
    await expect(page.locator('.academic-proof-strip')).toContainText('AI for SRE with UIUC');
    await expect(page.locator('.academic-proof-strip')).toContainText('ContextLedger, ctxhelm, PatchSmith');
    await expect(page.locator('.academic-proof-strip')).toContainText('Program analysis');

    const linkRow = page.locator('.academic-link-row').first();
    await expect(linkRow).toContainText('Email');
    await expect(linkRow).toContainText('CV');
    await expect(linkRow).toContainText('Scholar');
    await expect(linkRow).toContainText('Github');

    await expect(page.locator('#site-navigation')).not.toContainText('Education');
    await expect(page.locator('#site-navigation #themeToggle')).toHaveCount(0);
    await expect(page.locator('.academic-footer')).toContainText('Education');
    await expect(page.locator('#themeToggle.theme-toggle')).toHaveCount(1);
    await expect(page.locator('.back-to-top')).toHaveCount(0);
    await expect(page.locator('.mobile-nav-drawer')).toHaveCount(0);
  });

  test('homepage intro stacks text above portrait on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const copy = page.locator('.academic-intro__copy');
    const portrait = page.locator('.academic-portrait');
    const [copyBox, portraitBox] = await Promise.all([copy.boundingBox(), portrait.boundingBox()]);
    expect(copyBox).not.toBeNull();
    expect(portraitBox).not.toBeNull();
    expect(copyBox.y).toBeLessThan(portraitBox.y);
    await expectNoHorizontalOverflow(page, 'Homepage mobile academic intro');
  });

  test('publications render as compact media rows, not cards', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${BASE_URL}/publications`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.academic-publication')).toHaveCount(3);
    await expect(page.locator('.publication-card')).toHaveCount(0);
    await expect(page.locator('.academic-publication__media')).toHaveCount(3);
    await expect(page.locator('.academic-publication__title a')).toHaveCount(3);

    const firstMediaWidth = await page.locator('.academic-publication__media').first().evaluate((node) => node.getBoundingClientRect().width);
    expect(firstMediaWidth).toBeGreaterThanOrEqual(130);
    expect(firstMediaWidth).toBeLessThanOrEqual(180);
  });

  test('secondary pages share academic sections', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    for (const path of ['/about', '/research', '/projects', '/experience', '/learning', '/contributions']) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.academic-page')).toHaveCount(1);
      await expect(page.locator('.academic-section').first(), `${path} should expose an academic section.`).toBeVisible();
      await expectNoHorizontalOverflow(page, path);
    }
  });
});
