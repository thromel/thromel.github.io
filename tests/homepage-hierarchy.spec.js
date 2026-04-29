const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const SECTION_IDS = ['homepage-news', 'homepage-research-publications', 'homepage-education', 'homepage-work', 'homepage-projects', 'homepage-skills'];

test.describe('homepage hierarchy', () => {
  test('desktop homepage exposes academic intro and section targets', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#site-navigation')).toHaveCount(1);
    await expect(page.locator('.academic-intro')).toHaveCount(1);
    await expect(page.locator('.academic-link-row').first()).toContainText('CV');
    await expect(page.locator('.academic-link-row').first()).toContainText('Scholar');
    await expect(page.locator('.academic-current')).toContainText('Current Focus');
    await expect(page.locator('#site-navigation')).toContainText('Education');
    await expect(page.locator('#homepage-research-publications .academic-entry--selected')).toHaveCount(4);
    await expect(page.locator('#homepage-research-publications')).toContainText('See more research');
    await expect(page.locator('#homepage-education .academic-entry')).toHaveCount(3);
    await expect(page.locator('#homepage-education')).toContainText('See more education');

    for (const sectionId of SECTION_IDS) {
      await expect(page.locator(`#${sectionId}`), `Expected #${sectionId} to exist on the homepage.`).toHaveCount(1);
    }
  });

  test('homepage profile sections keep employer names and link education page', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#homepage-work')).toContainText('IQVIA');
    await expect(page.locator('#homepage-work')).toContainText('Mindshare Bangladesh');

    await page.goto(`${BASE_URL}/education`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.academic-page-title')).toHaveText('Education');
    await expect(page.locator('.section-education .education-entry')).toHaveCount(4);
    await expect(page.locator('a[href="https://u-a-goose.github.io/"]')).toHaveCount(1);
  });

  test('mobile intro keeps text above portrait and section links update the hash', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const copy = page.locator('.academic-intro__copy');
    const portrait = page.locator('.academic-portrait');
    const [copyBox, portraitBox] = await Promise.all([copy.boundingBox(), portrait.boundingBox()]);
    expect(copyBox).not.toBeNull();
    expect(portraitBox).not.toBeNull();
    expect(copyBox.y).toBeLessThan(portraitBox.y);

    await page.locator('.academic-link-row a[href="#homepage-education"]').click();
    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe('#homepage-education');
  });
});
