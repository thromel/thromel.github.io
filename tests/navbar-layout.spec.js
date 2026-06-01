const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const primaryRoutes = ['Home', 'Research', 'Publications', 'Projects', 'Contributions', 'CV'];
const secondaryRoutes = ['About', 'Education', 'Work', 'Achievements', 'News', 'Learning'];
const activeRouteCases = [
  { path: '/', name: 'Home' },
  { path: '/research', name: 'Research' },
  { path: '/publications', name: 'Publications' },
  { path: '/projects', name: 'Projects' },
  { path: '/contributions', name: 'Contributions' },
  { path: '/cv', name: 'CV' },
];
const metadataSourceFiles = [
  'index.html',
  'research.html',
  'publications.html',
  'projects.html',
  'contributions.html',
  'cv.html',
  'experience.html',
  'about.html',
];

test('academic navbar uses compact text links and no TR marker', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  const nav = page.locator('#site-navigation.academic-nav');
  await expect(nav).toHaveCount(1);
  await expect(nav).not.toContainText('TR');
  await expect(nav).not.toContainText('/');
  await expect(nav.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('academic navbar shows primary routes and leaves secondary routes to the footer', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  const nav = page.locator('#site-navigation.academic-nav');
  const footer = page.locator('.academic-footer');

  for (const route of primaryRoutes) {
    await expect(nav.getByRole('link', { name: route, exact: true })).toHaveCount(1);
  }

  for (const route of secondaryRoutes) {
    await expect(nav.getByRole('link', { name: route, exact: true })).toHaveCount(0);
    await expect(footer.getByRole('link', { name: route, exact: true })).toHaveCount(1);
  }
});

test('theme control is separate from route navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('.academic-shellbar')).toHaveCount(1);
  await expect(page.locator('#site-navigation #themeToggle')).toHaveCount(0);
  await expect(page.locator('.academic-utility #themeToggle.theme-toggle')).toHaveCount(1);
});

test('modern mobile navbar stays compact with an internal route rail', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  const metrics = await page.evaluate(() => {
    const header = document.querySelector('.academic-header').getBoundingClientRect();
    const shell = document.querySelector('.academic-shellbar').getBoundingClientRect();
    const nav = document.querySelector('#site-navigation');

    return {
      headerHeight: Math.round(header.height),
      shellHeight: Math.round(shell.height),
      viewportWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      navClientWidth: nav.clientWidth,
      navScrollWidth: nav.scrollWidth,
    };
  });

  expect(metrics.headerHeight).toBeLessThanOrEqual(80);
  expect(metrics.shellHeight).toBeLessThanOrEqual(56);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.navScrollWidth).toBeGreaterThan(metrics.navClientWidth);
});

test('shared link groups avoid slash dividers', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.academic-link-row').first()).not.toContainText('/');
  await expect(page.locator('.proof-links').first()).not.toContainText('/');

  await page.goto(`${BASE_URL}/research`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.academic-link-row').first()).not.toContainText('/');

  await page.goto(`${BASE_URL}/publications`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.publication-links').first()).not.toContainText('/');

  await page.goto(`${BASE_URL}/contributions`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.proof-links').first()).not.toContainText('/');

  await page.goto(`${BASE_URL}/education`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.education-entry__meta').first()).not.toContainText('/');
});

for (const route of activeRouteCases) {
  test(`academic navbar marks ${route.name} as active`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(BASE_URL + route.path, { waitUntil: 'domcontentloaded' });

    const nav = page.locator('#site-navigation.academic-nav');
    await expect(nav.getByRole('link', { name: route.name, exact: true })).toHaveAttribute('aria-current', 'page');
  });
}

test('core pages expose description front matter for metadata previews', async () => {
  for (const file of metadataSourceFiles) {
    const source = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
    const frontMatter = source.match(/^---\n([\s\S]*?)\n---/);

    expect(frontMatter, `${file} should have YAML front matter`).not.toBeNull();
    expect(frontMatter[1], `${file} should define one description field`).toMatch(/^description:\s+\S.+$/m);
    expect(frontMatter[1], `${file} should not reuse the generic site description`).not.toContain('Personal Academic Homepage');
  }
});
