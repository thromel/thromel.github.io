const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const PUBLICATION_DESTINATIONS = ['/research/ml-remote-code-execution/', '/research/ureporter/', '/research/blockchain-healthcare/'];

async function collectPathnames(locator) {
  return locator.evaluateAll((elements) => elements.map((element) => {
    const pathname = new URL(element.href, window.location.origin).pathname;
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  }));
}

async function expectNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth, `${label} should not introduce horizontal overflow.`).toBeLessThanOrEqual(dimensions.width + 1);
}

test.describe('Publications', () => {
  test('desktop archive publications use academic rows and meaningful destinations', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(`${BASE_URL}/publications`, { waitUntil: 'domcontentloaded' });

    const archiveSection = page.locator('.section-publications');
    await expect(archiveSection.locator('.academic-publication')).toHaveCount(PUBLICATION_DESTINATIONS.length);
    await expect(archiveSection.locator('.publication-year-group')).toHaveCount(PUBLICATION_DESTINATIONS.length);

    const archiveTitlePaths = await collectPathnames(archiveSection.locator('.academic-publication__title a'));
    const archivePrimaryPaths = await collectPathnames(archiveSection.locator('.academic-publication__links a.publication-link--primary'));
    expect(archiveTitlePaths).toEqual(PUBLICATION_DESTINATIONS);
    expect(archivePrimaryPaths).toEqual(PUBLICATION_DESTINATIONS);

    for (const destination of PUBLICATION_DESTINATIONS) {
      const response = await page.goto(BASE_URL + destination, { waitUntil: 'domcontentloaded' });
      expect(response && response.ok(), `Expected ${destination} to resolve.`).toBeTruthy();
      expect((await page.locator('main').innerText()).trim().length).toBeGreaterThan(200);
    }
  });

  test('mobile publications archive stays compact without overflow', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(`${BASE_URL}/publications`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.section-publications .academic-publication')).toHaveCount(PUBLICATION_DESTINATIONS.length);
    await expectNoHorizontalOverflow(page, 'Publications page');
  });
});
