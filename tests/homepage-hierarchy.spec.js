const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
// Desktop viewport: 1280, 720
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
// Mobile viewport: 390, 844
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const SECTION_IDS = [
  'homepage-news',
  'homepage-publications',
  'homepage-research',
  'homepage-work',
  'homepage-projects',
  'homepage-skills',
];

test.describe('homepage hierarchy', () => {
  test('desktop hero keeps one primary action row and exposes section navigation targets', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#site-navigation')).toHaveCount(1);
    await expect(page.locator('.hero-primary-actions')).toHaveCount(1);

    const primaryLinks = page.locator('.hero-primary-actions a');
    await expect(primaryLinks).toHaveCount(2);

    const primaryTexts = (await primaryLinks.allInnerTexts()).map((text) => text.replace(/\s+/g, ' ').trim());
    expect(primaryTexts).toEqual(['Research', 'CV']);

    await expect(page.locator('.home-section-nav')).toHaveCount(1);

    for (const sectionId of SECTION_IDS) {
      await expect(page.locator(`#${sectionId}`), `Expected #${sectionId} to exist on the homepage.`).toHaveCount(1);
    }
  });

  test('homepage profile sections keep employer names and link education to the dedicated page', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const workHeaders = page.locator('#homepage-work .timeline-item .timeline-header');
    await expect(workHeaders.first()).toContainText('IQVIA');
    await expect(workHeaders.nth(1)).toContainText('Mindshare Bangladesh');

    const educationCta = page.getByRole('link', { name: 'View Full Education →' });
    await expect(educationCta).toBeVisible();
    await educationCta.click();

    await expect(page).toHaveURL(/\/education\/?$/);
    await expect(page.locator('.page-intro-title')).toHaveText('Education');
    await expect(page.locator('.section-education .timeline-item')).toHaveCount(4);
    await expect(page.locator('a[href="https://u-a-goose.github.io/"]')).toHaveCount(1);
  });

  test('mobile hero keeps text above the portrait and section nav pills update the hash', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const heroContent = page.locator('.hero-content--intro');
    const heroPortrait = page.locator('.hero-image-wrapper');
    const sectionNav = page.locator('.home-section-nav');

    await expect(heroContent).toBeVisible();
    await expect(heroPortrait).toBeVisible();
    await expect(sectionNav).toHaveCount(1);

    const [contentBox, portraitBox] = await Promise.all([
      heroContent.boundingBox(),
      heroPortrait.boundingBox(),
    ]);

    expect(contentBox).not.toBeNull();
    expect(portraitBox).not.toBeNull();
    expect(
      contentBox.y,
      `Expected the mobile hero text block to render before the portrait, but content started at ${contentBox.y}px and the portrait started at ${portraitBox.y}px.`,
    ).toBeLessThan(portraitBox.y);
    expect(
      portraitBox.y + Math.min(portraitBox.height, 96),
      `Expected the mobile portrait to enter the first viewport, but it started at ${portraitBox.y}px with height ${portraitBox.height}px inside an ${MOBILE_VIEWPORT.height}px viewport.`,
    ).toBeLessThan(MOBILE_VIEWPORT.height);

    const projectsPill = page.locator('.home-section-nav a[href="#homepage-projects"]');
    await projectsPill.click();

    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe('#homepage-projects');
    await expect(page.locator('#homepage-projects')).toHaveCount(1);
  });
});
