const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };

const REAL_TITLES = [
  'An Empirical Study on Remote Code Execution in ML Model Hosting Ecosystems',
  'Sentiment Analysis of Anonymous Crisis Reports in Bangladesh',
  'Patient-Centric Blockchain Framework for EHR Management',
];

const EXPECTED_PRIMARY_DESTINATIONS = [
  '/research/ml-remote-code-execution/',
  '/research/ureporter/',
  '/research/blockchain-healthcare/',
];

const HOMEPAGE_SELECTED_TITLES = [
  'An Empirical Study on Remote Code Execution in ML Model Hosting Ecosystems',
  'The Choice Can Be the Attack: Auditing Aligned Backdoors in LLM Agents',
  'VeriSchema: Multi-Agent Framework for Generating Relational DB Schema & ERD',
  'Patient-Centric Blockchain Framework for EHR Management',
];

const PLACEHOLDER_TITLES = [
  'Convallis a cras semper auctor neque vitae rutrum quisque non tellus orci ac',
  'Pharetra Massa Massa Ultricies Mi Nisl Tincidunt',
  'Lorem ipsum: Dolor sit amet, consectetur adipiscing elit',
  'Publication without cover image',
];

async function gotoPage(page, path, fallbackPath = path) {
  const primaryResponse = await page.goto(BASE_URL + path, { waitUntil: 'domcontentloaded' });
  if (path === fallbackPath) return primaryResponse;
  if (!primaryResponse || primaryResponse.status() === 404) return page.goto(BASE_URL + fallbackPath, { waitUntil: 'domcontentloaded' });
  return primaryResponse;
}

async function collectPathnames(locator) {
  return locator.evaluateAll((elements) => elements.map((element) => {
    const pathname = new URL(element.href, window.location.origin).pathname;
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  }));
}

test.describe('publications data', () => {
  test('homepage selected work shows curated research entries and no placeholders', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoPage(page, '/');

    const section = page.locator('#homepage-research-publications');
    await expect(section).toBeVisible();
    await expect(section.locator('.academic-entry--selected')).toHaveCount(HOMEPAGE_SELECTED_TITLES.length);

    for (const title of HOMEPAGE_SELECTED_TITLES) {
      await expect(section, `Expected homepage selected work to include "${title}".`).toContainText(title);
    }
    for (const title of PLACEHOLDER_TITLES) {
      await expect(section, `Homepage selected work should not include placeholder title "${title}".`).not.toContainText(title);
    }
  });

  test('publications page renders real publication records instead of template examples', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoPage(page, '/publications', '/publications.html');

    const publicationsPage = page.locator('body');
    for (const title of REAL_TITLES) {
      await expect(publicationsPage, `Expected publications page to include "${title}".`).toContainText(title);
    }
    for (const title of PLACEHOLDER_TITLES) {
      await expect(publicationsPage, `Publications page should not include placeholder title "${title}".`).not.toContainText(title);
    }
  });

  test('archive primary publication actions avoid blank collection routes', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoPage(page, '/publications', '/publications.html');

    const archivePrimaryPaths = await collectPathnames(page.locator('.academic-publication .academic-publication__links a.publication-link--primary'));
    const archiveTitlePaths = await collectPathnames(page.locator('.academic-publication .academic-publication__title a'));

    expect(archivePrimaryPaths).toEqual(EXPECTED_PRIMARY_DESTINATIONS);
    expect(archiveTitlePaths).toEqual(EXPECTED_PRIMARY_DESTINATIONS);
    expect(archivePrimaryPaths.every((path) => !path.startsWith('/publications/'))).toBeTruthy();
  });
});
