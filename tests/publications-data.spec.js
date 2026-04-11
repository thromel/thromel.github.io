const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };

const REAL_TITLES = [
  'An Empirical Study on Remote Code Execution in ML Model Hosting Ecosystems',
  'Sentiment Analysis of Anonymous Crisis Reports in Bangladesh',
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

  if (path === fallbackPath) {
    return primaryResponse;
  }

  if (!primaryResponse || primaryResponse.status() === 404) {
    return page.goto(BASE_URL + fallbackPath, { waitUntil: 'domcontentloaded' });
  }

  return primaryResponse;
}

test.describe('publications data', () => {
  test('homepage publications show real entries and never render 1970 years', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await gotoPage(page, '/');

    const publicationsSection = page.locator('#homepage-publications');
    await expect(publicationsSection).toBeVisible();

    for (const title of REAL_TITLES) {
      await expect(publicationsSection, `Expected homepage publications to include "${title}".`).toContainText(title);
    }

    for (const title of PLACEHOLDER_TITLES) {
      await expect(publicationsSection, `Homepage publications should not include placeholder title "${title}".`).not.toContainText(title);
    }

    const years = await page.locator('#homepage-publications .timeline-date').allInnerTexts();
    expect(years, `Homepage publication years should not render as 1970. Saw: ${years.join(', ')}`).not.toContain('1970');
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
});
