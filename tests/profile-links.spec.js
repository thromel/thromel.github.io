const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4000';
const URLS = {
  buetCse: 'https://cse.buet.ac.bd/',
  buetBsc: 'https://cse.buet.ac.bd/academics/bsc',
  iqvia: 'https://www.iqvia.com/',
  orchestratedAnalytics: 'https://www.iqvia.com/solutions/commercialization/commercial-analytics/orchestrated-analytics',
  kpiLibrary: 'https://www.iqvia.com/library/fact-sheets/kpi-library',
  mindshare: 'https://www.mindshareworld.com/offices',
  srse: 'https://uiuc-srse.github.io/',
  ualberta: 'https://www.ualberta.ca/en/computing-science/index.html',
};

test('homepage links the institutions, employers, programs, and products named in profile copy', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  const identity = page.locator('[data-home-section="identity"]');
  await expect(identity.locator(`a[href="${URLS.ualberta}"]`)).toContainText('University of Alberta');
  await expect(identity.locator(`a[href="${URLS.iqvia}"]`)).toHaveText('IQVIA');

  const iqviaEntry = page.locator('[data-home-experience]').filter({ hasText: 'Software Development Engineer 1' });
  await expect(iqviaEntry.locator(`a[href="${URLS.iqvia}"]`)).toHaveCount(1);
  await expect(iqviaEntry.locator(`a[href="${URLS.orchestratedAnalytics}"]`)).toHaveCount(1);
  await expect(iqviaEntry.locator(`a[href="${URLS.kpiLibrary}"]`)).toHaveCount(1);
  const mindshareEntry = page.locator('[data-home-experience]').filter({ hasText: 'Full Stack Engineer' });
  await expect(mindshareEntry.locator(`a[href="${URLS.mindshare}"]`, { hasText: 'Mindshare Bangladesh' })).toHaveCount(1);
  await expect(page.locator(`[data-home-milestone] a[href="${URLS.srse}"]`)).toHaveCount(1);
});

test('experience page exposes future Alberta appointments and authoritative related links without mobile overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/experience`, { waitUntil: 'domcontentloaded' });

  const albertaEntry = page.locator('.experience-record').filter({ hasText: 'Graduate Teaching and Research Assistant' });
  await expect(albertaEntry).toContainText('GTA, GRA, and GRAF');
  await expect(albertaEntry).toContainText('Starting September 1, 2026');
  await expect(albertaEntry.locator(`h3 a[href="${URLS.ualberta}"]`)).toHaveCount(1);

  const iqviaEntry = page.locator('.experience-record').filter({ hasText: 'Software Development Engineer 1, IQVIA' });
  await expect(iqviaEntry).toContainText('KPI Library, the dynamic reporting layer within Orchestrated Analytics');
  await expect(iqviaEntry.locator(`a[href="${URLS.orchestratedAnalytics}"]`)).toHaveCount(1);
  await expect(iqviaEntry.locator(`a[href="${URLS.kpiLibrary}"]`)).toHaveCount(1);

  const dimensions = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
});

test('news titles resolve to their supporting institution, program, product, or research page', async ({ page }) => {
  await page.goto(`${BASE_URL}/news`, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#year-2026')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Starting M.Sc. study at the University of Alberta' })).toHaveAttribute('href', URLS.ualberta);
  await expect(page.getByRole('link', { name: 'Paper submitted to TACL 2026' })).toHaveAttribute('href', '/research/reagent-plus-plus/');
  await expect(page.getByRole('link', { name: 'Paper under review at ICSE 2027' })).toHaveAttribute('href', 'https://arxiv.org/abs/2601.14163');
  await expect(page.getByRole('link', { name: 'Started remote UIUC research internship' })).toHaveAttribute('href', URLS.srse);
  await expect(page.getByRole('link', { name: 'Started working as Software Development Engineer at IQVIA' })).toHaveAttribute('href', URLS.orchestratedAnalytics);
  await expect(page.getByRole('link', { name: 'Graduated from BUET' })).toHaveAttribute('href', URLS.buetBsc);
});

test('light theme uses the warm gradient and an opaque compact header', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  const styles = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const hero = getComputedStyle(document.querySelector('.home-identity'));
    const header = getComputedStyle(document.querySelector('.site-header'));
    const frame = document.querySelector('.site-header__frame').getBoundingClientRect();
    return {
      bodyBackground: body.backgroundColor,
      heroBackground: hero.backgroundImage,
      headerBackground: header.backgroundColor,
      backdropFilter: header.backdropFilter,
      headerHeight: frame.height,
    };
  });

  expect(styles.bodyBackground).toBe('rgb(245, 241, 232)');
  expect(styles.heroBackground).toContain('radial-gradient');
  expect(styles.headerBackground).toBe('rgb(255, 252, 245)');
  expect(styles.backdropFilter).toBe('none');
  expect(styles.headerHeight).toBeLessThanOrEqual(64);
});

test('achievements and CV source expose high-value evidence links', async ({ page }) => {
  await page.goto(`${BASE_URL}/achievements`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'Finalist, Blockchain Olympiad Bangladesh 2021' })).toHaveAttribute('href', 'https://bcolbd.org/2021/teams');
  await expect(page.getByRole('link', { name: "Dean's List Award" })).toHaveAttribute('href', 'https://cse.buet.ac.bd/academics/fund');

  const cvSource = fs.readFileSync(path.join(__dirname, '..', '_posts', 'cv.tex'), 'utf8');
  expect(cvSource).toContain('\\href{https://www.ualberta.ca/en/computing-science/index.html}{University of Alberta}');
  expect(cvSource).toContain('\\href{https://cse.buet.ac.bd/academics/bsc}{Bangladesh University of Engineering and Technology (BUET)}');
  expect(cvSource).toContain('\\href{https://www.iqvia.com/library/fact-sheets/kpi-library}{KPI Library}');
  expect(cvSource).toContain('\\href{https://www.iqvia.com/solutions/commercialization/commercial-analytics/orchestrated-analytics}{IQVIA Orchestrated Analytics}');
  expect(cvSource).toContain("\\href{https://cse.buet.ac.bd/academics/fund}{Dean's List Award}");
});
